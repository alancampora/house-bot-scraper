import dbConnect from '../../lib/mongoose';
import Place from '../../models/place';

export default async function handler(req: any, res: any) {
  await dbConnect();

  switch (req.method) {
    case 'GET': {
      return getPlaces(req, res);
    }
  }
}

async function getPlaces(_: any, res: any) {
  const places = await Place.find({});

  return res.json(places);
}

