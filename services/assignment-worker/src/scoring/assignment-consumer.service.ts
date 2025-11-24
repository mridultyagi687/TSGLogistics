import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type {
  LoadAssignmentStatus,
  LoadOrder,
  VendorCapability,
  VendorSummary
} from "@tsg/shared";
import type { AssignmentWorkerConfiguration } from "../config/app.config";
import { OrdersHttpService } from "./orders-http.service";
import { VendorsHttpService } from "./vendors-http.service";
import { ScoringStrategyService } from "./scoring-strategy.service";

const TARGET_STATUS: LoadAssignmentStatus = "SOURCING";

@Injectable()
export class AssignmentConsumerService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(AssignmentConsumerService.name);
  private isProcessing = false;
  private readonly pollInterval: number;
  private lastRun = 0;
  private timer?: NodeJS.Timeout;

  constructor(
    private readonly ordersHttp: OrdersHttpService,
    private readonly vendorsHttp: VendorsHttpService,
    private readonly scoring: ScoringStrategyService,
    private readonly configService: ConfigService<AssignmentWorkerConfiguration>
  ) {
    this.pollInterval = Number(
      this.configService.get<number>("POLL_INTERVAL_MS") ?? 15000
    );
  }

  onModuleInit() {
    this.logger.log(
      `Assignment consumer timer started (interval=${this.pollInterval}ms)`
    );
    this.timer = setInterval(() => {
      void this.handleCycle();
    }, this.pollInterval);
  }

  onModuleDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  async handleCycle() {
    const now = Date.now();
    if (now - this.lastRun < this.pollInterval) {
      return;
    }
    if (this.isProcessing) {
      return;
    }
    this.isProcessing = true;
    this.lastRun = now;
    try {
      await this.processAssignments();
    } catch (error) {
      this.logger.error(
        `Failed to process assignment cycle: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      this.isProcessing = false;
    }
  }

  private async processAssignments() {
    const loads = await this.ordersHttp.listLoads();
    const pendingLoads = loads.filter(
      (load) => load.assignmentStatus === TARGET_STATUS
    );

    if (pendingLoads.length === 0) {
      return;
    }

    this.logger.log(
      `Processing ${pendingLoads.length} loads for assignment (interval=${this.pollInterval}ms)`
    );

    const vendors = await this.vendorsHttp.listVendors();
    const candidateBundles: Array<{
      vendor: VendorSummary;
      capabilities: VendorCapability[];
    }> = await Promise.all(
      vendors.map(async (vendor) => ({
        vendor,
        capabilities: await this.vendorsHttp.listCapabilities(vendor.id)
      }))
    );

    for (const load of pendingLoads) {
      await this.processLoad(load, candidateBundles);
    }
  }

  private async processLoad(
    load: LoadOrder,
    candidates: Array<{ vendor: VendorSummary; capabilities: VendorCapability[] }>
  ) {
    const scored = this.scoring.scoreCandidates(load, candidates);

    if (scored.length === 0) {
      this.logger.warn(`No candidates found for load ${load.id}`);
      return;
    }

    const best = scored[0];

    this.logger.log(
      `Creating assignment for load ${load.id} with vendor ${best.vendor.id} (score=${best.score.toFixed(2)})`
    );

    const assignment = await this.vendorsHttp.createAssignment({
      orgId: load.orgId,
      vendorId: best.vendor.id,
      loadId: load.id,
      score: Number(best.score.toFixed(4)),
      metadata: {
        ...best.metadata,
        generatedAt: new Date().toISOString()
      }
    });

    await this.ordersHttp.linkAssignment(load.id, {
      assignmentId: assignment.id,
      status: "OFFERED",
      metadata: assignment.metadata ?? best.metadata,
      lockedAt: new Date()
    });
  }
}
