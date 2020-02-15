export interface Leg {
  start_address: {
    city: string,
    state: string
  };
  end_address: {
    city: string,
    state: string
  };
  duration: {
    text: string,
    value: number
  };
  distance: {
    text: string,
    value: number
  };
  image?: string;
}
