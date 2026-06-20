import { Controller, Get } from '@nestjs/common'

@Controller()
export class HealthController {
  @Get('health')
  getHealth() {
    return {
      ok: true,
      commit: process.env.RAILWAY_GIT_COMMIT_SHA ?? null,
    }
  }
}
