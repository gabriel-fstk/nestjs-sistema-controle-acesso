import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CurrentUser } from '../shared/decorators/current-user.decorator';
import { RequirePermission } from '../shared/decorators/require-permission.decorator';
import { PermissionGuard } from '../permissions/guards/permission.guard';
import { ModuleType } from '../shared/constants/enums';

@ApiTags('profile')
@ApiBearerAuth()
@Controller('profile')
@UseGuards(PermissionGuard)
@RequirePermission(ModuleType.PROFILE)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @ApiOperation({ summary: 'Obter perfil do usuário logado' })
  async getProfile(@CurrentUser() user: any) {
    return this.profileService.getProfile(user.sub);
  }

  @Patch()
  @ApiOperation({ summary: 'Atualizar perfil do usuário logado' })
  async updateProfile(
    @Body() updateProfileDto: UpdateProfileDto,
    @CurrentUser() user: any,
  ) {
    return this.profileService.updateProfile(user.sub, updateProfileDto);
  }
}