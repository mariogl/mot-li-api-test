import moment from "moment";
import CustomError from "../../CustomError/CustomError.js";
import Game from "../../database/models/Game.js";
import { type GameDataStructure, type GameStructure } from "../../types.js";
import { type GamesRepository } from "./types.js";

class GamesMongoRepository implements GamesRepository {
  async getGames(): Promise<GameStructure[]> {
    const today = moment().utcOffset(2).startOf("day").valueOf();

    const games = await Game.find({
      date: { $gte: today },
    }).sort({ date: 1 });

    return games;
  }

  async getAllGames(): Promise<GameStructure[]> {
    const games = await Game.find().sort({ date: 1 });

    return games;
  }

  async getGameById(gameId: string): Promise<GameStructure | undefined> {
    const game = await Game.findById(gameId);

    return game ? game : undefined;
  }

  async getCurrentGame(): Promise<GameStructure> {
    const todayReset = moment().utcOffset(2).startOf("day").utc(true);

    const game = await Game.findOne({ date: todayReset });

    if (!game) {
      throw new CustomError("Game not found", 404);
    }

    return game;
  }

  async addGame(game: GameDataStructure): Promise<GameStructure> {
    const newGame = new Game({
      ...game,
      length: game.word.length,
      date: new Date(new Date(game.date).toUTCString()).setUTCHours(0, 0, 0, 0),
    });

    const existingGame = await Game.findOne({ date: newGame.date });

    if (existingGame) {
      throw new CustomError("Game exists", 409);
    }

    await newGame.save();

    return newGame;
  }

  async deleteGame(gameId: string): Promise<string> {
    const deletedGame = await Game.findByIdAndDelete(gameId);

    if (!deletedGame) {
      throw new CustomError("Game not found", 404);
    }

    return deletedGame._id.toString();
  }

  async updateGame(game: GameStructure): Promise<GameStructure> {
    const updatedGame = await Game.findByIdAndUpdate(game._id, game, {
      new: true,
    });

    if (!updatedGame) {
      throw new CustomError("Game not found", 404);
    }

    return updatedGame;
  }
}

export default GamesMongoRepository;
