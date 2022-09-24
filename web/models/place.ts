import mongoose from 'mongoose';

const PlaceSchema = new mongoose.Schema({
  source: {
    type: String,
  },
  code: {
    type: String,
  },
  title: {
    type: String,
  },
  url: {
    type: String,
  },
  html: {
    type: String,
  },
  imgs: {
    type: [String],
  },
});

export interface IPlace extends mongoose.Document {
  source: string;
  code: string;
  title: string;
  url: string;
  html: string;
  imgs: string[];
}

export default mongoose.model<IPlace>('Place', PlaceSchema);
