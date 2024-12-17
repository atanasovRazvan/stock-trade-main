import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale, TimeScale } from "chart.js";
import "chartjs-adapter-date-fns";
import ReactDOM from "react-dom/client";

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale, TimeScale);

const App = () => {
    const [tabIndex, setTabIndex] = useState(0);
    const [historyData, setHistoryData] = useState([]);
    const [forecastData, setForecastData] = useState([]);
    const [realtimeData, setRealtimeData] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState("BOTH");
    const [timeFilter, setTimeFilter] = useState("YEAR");
    const wsRef = useRef(null);
    const companies = ["NIKE", "SKECHERS"];

    console.log("Realtime Data: ", realtimeData);

    // Fetch historical and forecast data
    useEffect(() => {
        const fetchData = async () => {
            const historyRes = await axios.get("http://localhost:3000/api/history");
            const forecastRes = await axios.get("http://localhost:3000/api/forecast");
            setHistoryData(historyRes.data?.data);
            setForecastData(forecastRes.data?.data);
        };
        fetchData();
    }, []);

    // WebSocket connection for real-time data
    useEffect(() => {
        if (tabIndex === 1) { // Realtime tab
            wsRef.current = new WebSocket("ws://localhost:8000");
            wsRef.current.onmessage = (event) => {
                try {
                    console.log("New realtime data:", event.data);
                    // Parse and flatten incoming message
                    const rawMessage = JSON.parse(event.data);
                    const flattenedData = rawMessage.flat();

                    // Update real-time data by appending new entries
                    setRealtimeData((prev) => [...prev, ...flattenedData]);
                } catch (error) {
                    console.error("Error parsing WebSocket message:", error);
                }
            };
        } else {
            // Close the WebSocket connection and reset real-time data
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
            setRealtimeData([]); // Clear real-time data when leaving the tab
        }

        return () => {
            if (wsRef.current) wsRef.current.close();
        };
    }, [tabIndex]);


    // Filter data based on time range
    const filterDataByTime = (data) => {
        const now = new Date();
        return data?.filter((entry) => {
            const entryTime = new Date(entry.timestamp);

            if (timeFilter === "YEAR") return entryTime.getFullYear() === now.getFullYear();
            if (timeFilter === "MONTH") return entryTime.getMonth() === now.getMonth() && entryTime.getFullYear() === now.getFullYear();
            if (timeFilter === "WEEK") {
                const oneWeekAgo = new Date(now);
                oneWeekAgo.setDate(now.getDate() - 7);
                return entryTime >= oneWeekAgo;
            }
            if (timeFilter === "DAY") {
                return (
                    entryTime.getDate() === now.getDate() &&
                    entryTime.getMonth() === now.getMonth() &&
                    entryTime.getFullYear() === now.getFullYear()
                );
            }
            return true;
        });
    };

    // Prepare chart data
    const prepareChartData = () => {
        const filteredHistory = filterDataByTime(historyData);
        const filteredForecast = filterDataByTime(forecastData);
        const filteredRealtime = filterDataByTime(realtimeData);

        const dataSets = companies.map((company) => {
            if (selectedCompany !== "BOTH" && selectedCompany !== company) return null;

            const history = filteredHistory.filter((d) => d.company === company);
            const forecast =
                tabIndex === 0
                    ? filteredForecast.filter((d) => d.company === company)
                    : filteredRealtime.filter((d) => d.company === company);

            // Merge history and forecast data for a continuous line
            const mergedData = [
                ...history.map((d) => ({ x: d.timestamp, y: d.open, forecast: false })),
                ...forecast.map((d) => ({ x: d.timestamp, y: d.open, forecast: true })),
            ];

            return {
                label: `${company}`,
                data: mergedData,
                borderColor: company === "NIKE" ? "darkblue" : "darkgreen", // Stronger colors
                backgroundColor: "transparent",
                borderWidth: 2,
                pointRadius: 0,
                segment: {
                    borderDash: (ctx) => (ctx.p0.raw.forecast ? [5, 5] : undefined), // Dashed line for forecast
                },
            };
        });

        return {
            datasets: dataSets.filter(Boolean),
        };
    };


    return (
        <div style={{ padding: "20px" }}>
            <h1>Company Data Visualization</h1>
            <Tabs selectedIndex={tabIndex} onSelect={(index) => setTabIndex(index)}>
                <TabList>
                    <Tab>Evolution</Tab>
                    <Tab>Realtime</Tab>
                </TabList>

                <TabPanel>
                    <div>
                        <h3>Evolution</h3>
                        <label>Time Range: </label>
                        <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)}>
                            <option value="YEAR">Current Year</option>
                            <option value="MONTH">Current Month</option>
                            <option value="WEEK">Last Week</option>
                        </select>
                        <label> Show Company: </label>
                        <select value={selectedCompany} onChange={(e) => setSelectedCompany(e.target.value)}>
                            <option value="BOTH">Both</option>
                            {companies.map((c) => (
                                <option key={c} value={c}>
                                    {c}
                                </option>
                            ))}
                        </select>
                        <Line data={prepareChartData()} options={{ responsive: true, plugins: { legend: { display: true } }, scales: { x: { type: "time" }, y: { beginAtZero: false } } }} />
                    </div>
                </TabPanel>

                <TabPanel>
                    <div>
                        <h3>Realtime</h3>
                        <label>Time Range: </label>
                        <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)}>
                            <option value="YEAR">Current Year</option>
                            <option value="MONTH">Current Month</option>
                            <option value="WEEK">Last Week</option>
                            <option value="DAY">Current Day</option>
                        </select>
                        <label> Show Company: </label>
                        <select value={selectedCompany} onChange={(e) => setSelectedCompany(e.target.value)}>
                            <option value="BOTH">Both</option>
                            {companies.map((c) => (
                                <option key={c} value={c}>
                                    {c}
                                </option>
                            ))}
                        </select>
                        <Line data={prepareChartData()} options={{
                            responsive: true,
                            plugins: {legend: {display: true}},
                            scales: {x: {type: "time"}, y: {beginAtZero: false}}
                        }}/>
                    </div>
                </TabPanel>
            </Tabs>
        </div>
    );
};

const rootElement = document.getElementById("app")
if (!rootElement) throw new Error("Failed to find the root element")

const root = ReactDOM.createRoot(rootElement)

root.render(<App/>)

export default App;
