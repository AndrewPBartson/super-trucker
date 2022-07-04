export interface ITripInput {
  avg_speed?: number;
  depart_time?: Date;
  depart_time_msec?: number;
  end_point: string;
  hotels?: boolean;
  hours_driving?: number;
  miles_per_day?: number;
  origin: string;
  timezone_city: string;
  truck_stops?: boolean;
  weather?: boolean;
}
