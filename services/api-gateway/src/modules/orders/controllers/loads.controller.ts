import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  Patch,
  Post
} from "@nestjs/common";
import { OrdersService } from "../orders.service";

@Controller("/api/loads")
export class LoadsController {
  private readonly logger = new Logger(LoadsController.name);

  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async create(@Body() payload: unknown) {
    try {
      return await this.ordersService.createLoad(payload);
    } catch (error) {
      this.logger.error("Failed to create load", error);
      if (error instanceof Error) {
        if (error.message.includes("unavailable") || error.message.includes("ECONNREFUSED")) {
          throw new HttpException(
            {
              statusCode: HttpStatus.SERVICE_UNAVAILABLE,
              message: "Orders service is unavailable. Please ensure the orders service is running.",
              error: "Service Unavailable"
            },
            HttpStatus.SERVICE_UNAVAILABLE
          );
        }
        throw new HttpException(
          {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: error.message,
            error: "Internal Server Error"
          },
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
      throw error;
    }
  }

  @Patch(":id/publish")
  publish(@Param("id") id: string) {
    return this.ordersService.publishLoad(id);
  }

  @Get()
  findAll() {
    return this.ordersService.listLoads();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.ordersService.getLoad(id);
  }

  @Patch(":id/assignment")
  linkAssignment(
    @Param("id") id: string,
    @Body() payload: unknown
  ) {
    return this.ordersService.linkLoadAssignment(id, payload);
  }

  @Patch(":id/assignment/status")
  updateAssignmentStatus(
    @Param("id") id: string,
    @Body() payload: unknown
  ) {
    return this.ordersService.updateLoadAssignmentStatus(id, payload);
  }

  @Delete(":id/assignment")
  clearAssignment(@Param("id") id: string) {
    return this.ordersService.clearLoadAssignment(id);
  }
}

