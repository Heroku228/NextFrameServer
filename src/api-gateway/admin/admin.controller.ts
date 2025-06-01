import { Controller, UseGuards, UseInterceptors } from '@nestjs/common'
import { Roles } from 'common/decorators/Roles.decorator'
import { JwtAuthGuard } from 'common/guards/JwtAuthGuard.guard'
import { RolesGuard } from 'common/guards/RolesGuard.guard'

/**
 * Админский контроллер для управления административными функциями.
 * Этот контроллер защищен JWT и ролями, доступен только для администраторов.
 */

@Controller('admin')
@UseInterceptors()
@Roles('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController { 




}
