import { useEffect, useState } from 'react';

interface Forecast {
    date: string;
    temperatureC: number;
    temperatureF: number;
    summary: string;
}

/**
 * Retains the original weather forecast demo so it can be reused or referenced
 * after the timetable experience replaces the default view.
 */
export function WeatherForecast() {
    const [forecasts, setForecasts] = useState<Forecast[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        void populateWeatherData();
    }, []);

    if (error) {
        return <p role="alert">Failed to load weather data: {error}</p>;
    }

    if (forecasts === null) {
        return (
            <p>
                <em>
                    Loading... Please refresh once the ASP.NET backend has started. See{' '}
                    <a href="https://aka.ms/jspsintegrationreact">https://aka.ms/jspsintegrationreact</a>{' '}
                    for more details.
                </em>
            </p>
        );
    }

    return (
        <div>
            <h1 id="forecastTableLabel">Weather forecast</h1>
            <p>This component demonstrates fetching data from the server.</p>
            <table className="table" aria-labelledby="forecastTableLabel">
                <thead>
                    <tr>
                        <th scope="col">Date</th>
                        <th scope="col">Temp. (C)</th>
                        <th scope="col">Temp. (F)</th>
                        <th scope="col">Summary</th>
                    </tr>
                </thead>
                <tbody>
                    {forecasts.map((forecast) => (
                        <tr key={forecast.date}>
                            <td>{forecast.date}</td>
                            <td>{forecast.temperatureC}</td>
                            <td>{forecast.temperatureF}</td>
                            <td>{forecast.summary}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    async function populateWeatherData() {
        try {
            const response = await fetch('/weatherforecast');
            if (!response.ok) {
                throw new Error(`${response.status} ${response.statusText}`);
            }

            const data: Forecast[] = await response.json();
            setForecasts(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        }
    }
}
