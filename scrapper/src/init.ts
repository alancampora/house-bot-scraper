import * as dotenv from 'dotenv' 

const init = () => {
  if (process.env.ENV === 'DEV') {
    dotenv.config();
    console.log('mongo', process.env.MONGODB_URI);
    console.log('daleeee', process.env);
  }
};

export default init;
