import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import City from "./City.js"; // Add the .js extension for ES module imports

const historyFilePath = path.join(__dirname, "../../data/searchHistory.json");

class HistoryService {
  private async read(): Promise<City[]> {
    if (fs.existsSync(historyFilePath)) {
      const data = fs.readFileSync(historyFilePath, "utf-8");
      return JSON.parse(data);
    }
    return [];
  }

  private async write(cities: City[]): Promise<void> {
    fs.writeFileSync(historyFilePath, JSON.stringify(cities, null, 2));
  }

  async getCities(): Promise<City[]> {
    return await this.read();
  }

  async addCity(cityName: string): Promise<void> {
    const cities = await this.getCities();
    const newCity = new City(cityName); // Create a new City object
    cities.push(newCity); // Add it to the array
    await this.write(cities); // Save the updated list
  }

  async removeCity(id: string): Promise<void> {
    const cities = await this.getCities();
    const updatedCities = cities.filter((city: any) => city.id !== id);
    await this.write(updatedCities); // Save the updated list
  }
}

export default new HistoryService();
