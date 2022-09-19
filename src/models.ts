import mongoose from 'mongoose';

const PlaceSchema = new mongoose.Schema({
  source: {
    type: String,
  },
  code: {
    type: String,
  },
  url: {
    type: String,
  },
  html: {
    type: String,
  },
});

export interface IPlace extends mongoose.Document {
  source: string;
  code: string;
  url: string;
  html: string;
}

export const PlaceModel =
  mongoose.model<IPlace>('Place', PlaceSchema);
