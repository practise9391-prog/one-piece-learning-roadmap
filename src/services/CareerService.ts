import { CareerRepository, careerRepository } from '../repositories/CareerRepository';
import { CareerRoadmap, CareerProject, CareerReadiness } from '../models/Career';

export class CareerService {
  private static instance: CareerService;
  private repository: CareerRepository;

  private constructor() {
    this.repository = careerRepository;
  }

  public static getInstance(): CareerService {
    if (!CareerService.instance) {
      CareerService.instance = new CareerService();
    }
    return CareerService.instance;
  }

  async getRoadmaps(): Promise<CareerRoadmap[]> {
    return this.repository.getCareerRoadmaps();
  }

  async getProjects(): Promise<CareerProject[]> {
    return this.repository.getCareerProjects();
  }

  async getReadiness(): Promise<CareerReadiness> {
    return this.repository.getCareerReadiness();
  }
}

export const careerService = CareerService.getInstance();
