import Redis from 'ioredis';

const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    keyPrefix: 'oauth:',
});

redis.on('error', (err) => {
    console.error('Redis connection error:', err);
});

redis.on('ready', () => {
    console.log('Redis is ready');
});

redis.on('connect', () => {
    console.log('Connected to Redis');
});

export default redis;
