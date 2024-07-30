import express, {Application} from 'express';
import {Server} from 'http';
import {AddressInfo} from 'net';
import {TargetManager} from './services/targetManager';
import routes from './router';

// TODO add health check endpoint

// Start express app
const port = process.env.PORT || 7000;
const trustProxy: boolean = process.env.PROXY === 'true';

const app: Application = express();

app.set('trust proxy', trustProxy);
app.set('x-powered-by', false);

// Middlewares
app.use(express.json());

// Load targets
TargetManager.load();

app.use(routes);

// Create server
const server: Server = app.listen(port, () => {
    let {port} = server.address() as AddressInfo;
    console.log('MailForm started on port ' + port);
});

process.on('SIGTERM', () => {
    console.debug('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.debug('HTTP server closed');
    });
});
