import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import plugin from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import child_process from 'child_process';
import { env } from 'process';

const baseFolder =
    env.APPDATA !== undefined && env.APPDATA !== ''
        ? `${env.APPDATA}/ASP.NET/https`
        : `${env.HOME}/.aspnet/https`;

const certificateName = "perfecttimetable.client";
const certFilePath = path.join(baseFolder, `${certificateName}.pem`);
const keyFilePath = path.join(baseFolder, `${certificateName}.key`);
const launchSettingsPath = fileURLToPath(new URL('../PerfectTimetable.Server/Properties/launchSettings.json', import.meta.url));
const target = getServerProxyTarget();
console.log('Proxy target:', target);

type LaunchSettings = {
    profiles: {
        https?: {
            applicationUrl?: string;
        };
    };
};

function getServerProxyTarget(): string {
    const target = getServerHttpsUrlFromLaunchSettings();
    if (!target) {
        throw new Error('Missing server https launchSettings URL for Vite proxy');
    }
    return target;
}

function getServerHttpsUrlFromLaunchSettings(): string | undefined {
    const launchSettings = JSON.parse(fs.readFileSync(launchSettingsPath, 'utf8')) as LaunchSettings;
    const applicationUrl = launchSettings.profiles.https?.applicationUrl;

    return applicationUrl ? getHttpsUrls(applicationUrl)[0] : undefined;
}

function getHttpsUrls(urls: string): string[] {
    return urls
        .split(';')
        .map(url => url.trim())
        .filter(url => url.startsWith('https://'));
}


if (!fs.existsSync(baseFolder)) {
    fs.mkdirSync(baseFolder, { recursive: true });
}

if (!fs.existsSync(certFilePath) || !fs.existsSync(keyFilePath)) {
    if (0 !== child_process.spawnSync('dotnet', [
        'dev-certs',
        'https',
        '--export-path',
        certFilePath,
        '--format',
        'Pem',
        '--no-password',
    ], { stdio: 'inherit', }).status) {
        throw new Error("Could not create certificate.");
    }
}


// https://vitejs.dev/config/
export default defineConfig({
    plugins: [plugin()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    server: {
        proxy: {
            '^/(timetable|weatherforecast)': {
                target,
                secure: false,
            },
        },
        port: 49935,
        https: {
            key: fs.readFileSync(keyFilePath),
            cert: fs.readFileSync(certFilePath),
        }
    }
})
