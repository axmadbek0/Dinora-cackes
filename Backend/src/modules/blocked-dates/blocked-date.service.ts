import { BlockedDateRepository, BlockDateDTO, BlockDateRangeDTO } from './blocked-date.repository.js';

export class BlockedDateService {
  private repository: BlockedDateRepository;

  constructor() {
    this.repository = new BlockedDateRepository();
  }

  public async getBlockedDates() {
    return await this.repository.findAll();
  }

  public async blockDate(dto: BlockDateDTO) {
    if (!dto.date) {
      throw new Error('Sana kiritilishi shart!');
    }
    return await this.repository.blockDate(dto);
  }

  public async blockDateRange(dto: BlockDateRangeDTO) {
    if (!dto.startDate || !dto.endDate) {
      throw new Error('Boshlang\'ich va tugash sanasi kiritilishi shart!');
    }
    return await this.repository.blockDateRange(dto);
  }

  public async unblockDate(date: string) {
    if (!date) {
      throw new Error('O\'chiriladigan sana kiritilishi shart!');
    }
    return await this.repository.unblockDate(date);
  }
}
