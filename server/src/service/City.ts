import { v4 as uuidv4 } from "uuid"; // Ensure you have uuid installed

class City {
  id: string;
  name: string;

  constructor(name: string) {
    this.id = uuidv4(); // Generate a unique ID for each city
    this.name = name;
  }
}

export default City;
