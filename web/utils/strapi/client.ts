import { strapi } from '@strapi/client';

export const S_CLIENT = strapi({ 
    baseURL: 'http://localhost:1337/api',
    auth: 'd02083154a559ae34f318f0f1882f148db734173dd593cfe9c777de124e1bacc61f57d189578c6527f340cdc34d2f0efd6c5819cffd8fbf345bced70efda620e07a63b560269f03336d7dc78674979db1d0d82536845bc2d2ae6b0dbf44d22d276b9e4bfb0e18860e4ab647351572b8602c73e63138a55939f6ddc91df1e90a6'
});

