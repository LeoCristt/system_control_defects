import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';

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

  @IsOptional()
  @IsNumber()
  assignee_id?: number;

  @IsNumber()
  priority_id: number;

  @IsNumber()
  status_id: number;

  @IsOptional()
  @IsDateString()
  due_date?: string;
}
