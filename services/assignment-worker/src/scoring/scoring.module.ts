import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { ConfigModule } from "@nestjs/config";
import { VendorsHttpService } from "./vendors-http.service";
import { OrdersHttpService } from "./orders-http.service";
import { ScoringStrategyService } from "./scoring-strategy.service";
import { AssignmentConsumerService } from "./assignment-consumer.service";

@Module({
  imports: [ConfigModule, HttpModule],
  providers: [
    VendorsHttpService,
    OrdersHttpService,
    ScoringStrategyService,
    AssignmentConsumerService
  ]
})
export class ScoringModule {}
