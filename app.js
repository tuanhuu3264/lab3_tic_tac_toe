import express from 'express';
import { create } from 'express-handlebars';

const app = express();
const hbs = create({

});

app.engine('handlebars', hbs.engine);

