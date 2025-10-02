import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateDefectDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsNumber()
  project_id: number;

  @IsOptional()
  @IsNumber()
  stage_id?: number;

  @IsNumber()
  priority_id: number;
}
