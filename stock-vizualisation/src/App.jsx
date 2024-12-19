import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Line, Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    LineElement,
    PointElement,
    BarElement,
    CategoryScale,
    LinearScale,
    TimeScale,
    Filler
} from "chart.js";
import "chartjs-adapter-date-fns";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import ReactDOM from "react-dom/client";

ChartJS.register(
    Title,
    Tooltip,
    Legend,
    LineElement,
    PointElement,
    BarElement,
    CategoryScale,
    LinearScale,
    TimeScale,
    Filler
);

const App = () => {
    const [tabIndex, setTabIndex] = useState(0);
    const [historyData, setHistoryData] = useState([]);
    const [forecastData, setForecastData] = useState([]);
    const [realtimeData, setRealtimeData] = useState([]);
    const [timeFilter, setTimeFilter] = useState("YEAR");
    const [priceType, setPriceType] = useState("open");
    const wsRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            const historyRes = await axios.get("http://localhost:3000/api/history");
            const forecastRes = await axios.get("http://localhost:3000/api/forecast");
            setHistoryData(historyRes.data?.data || []);
            setForecastData(forecastRes.data?.data || []);
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (tabIndex === 1) {
            wsRef.current = new WebSocket("ws://localhost:8000");
            wsRef.current.onmessage = (event) => {
                try {
                    const rawMessage = JSON.parse(event.data);
                    const flattenedData = rawMessage.flat();
                    setRealtimeData((prev) => [...prev, ...flattenedData]);
                } catch (error) {
                    console.error("Error parsing WebSocket message:", error);
                }
            };
        } else {
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
            setRealtimeData([]);
        }

        return () => {
            if (wsRef.current) wsRef.current.close();
        };
    }, [tabIndex]);

    const filterDataByTime = (data) => {
        const now = new Date();
        return data.filter((entry) => {
            const entryTime = new Date(entry.timestamp);
            if (timeFilter === "YEAR") return entryTime.getFullYear() === now.getFullYear();
            if (timeFilter === "MONTH") return entryTime.getMonth() === now.getMonth();
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

    const calculateAverage = (data, company) => {
        const filteredData = data.filter((d) => d.company === company);
        const sum = filteredData.reduce((acc, d) => acc + d[priceType], 0);
        return (sum / filteredData.length).toFixed(2);
    };

    const formatDate = (date) => {
        const d = new Date(date);
        const formatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
        return formatter.format(d); // Returns formatted date like "Jan 1"
    };

    const getChartData = (data, forecast = []) => {
        const chartData = filterDataByTime(data);
        const forecastData = filterDataByTime(forecast);

        const nikeData = chartData.filter((d) => d.company === "NIKE");
        const skechersData = chartData.filter((d) => d.company === "SKECHERS");

        const nikeForecast = forecastData.filter((d) => d.company === "NIKE");
        const skechersForecast = forecastData.filter((d) => d.company === "SKECHERS");

        const lineChartData = {
            datasets: [
                {
                    label: "Nike",
                    data: nikeData.map((d) => ({ x: formatDate(d.timestamp), y: d[priceType] })),
                    borderColor: "rgba(75, 192, 192, 1)",
                    borderWidth: 2,
                    fill: false,
                    pointRadius: 0,
                },
                {
                    label: "Skechers",
                    data: skechersData.map((d) => ({ x: formatDate(d.timestamp), y: d[priceType] })),
                    borderColor: "rgba(128, 75, 192, 1)",
                    borderWidth: 2,
                    fill: false,
                    pointRadius: 0,
                },
                {
                    label: "Nike Forecast",
                    data: nikeForecast.map((d) => ({ x: formatDate(d.timestamp), y: d[priceType] })),
                    borderColor: "rgba(75, 192, 192, 0.7)",
                    borderWidth: 2,
                    borderDash: [5, 5],
                    fill: false,
                    pointRadius: 0,
                },
                {
                    label: "Skechers Forecast",
                    data: skechersForecast.map((d) => ({ x: formatDate(d.timestamp), y: d[priceType] })),
                    borderColor: "rgba(128, 75, 192, 0.7)",
                    borderWidth: 2,
                    borderDash: [5, 5],
                    fill: false,
                    pointRadius: 0,
                },
            ],
        };

        const barChartData = {
            labels: ["Nike", "Skechers"],
            datasets: [
                {
                    label: "Open",
                    data: [
                        nikeData[nikeData.length - 1]?.open || 0,
                        skechersData[skechersData.length - 1]?.open || 0,
                    ],
                    backgroundColor: "rgba(255, 206, 86, 0.7)", // Yellow
                },
                {
                    label: "Close",
                    data: [
                        nikeData[nikeData.length - 1]?.close || 0,
                        skechersData[skechersData.length - 1]?.close || 0,
                    ],
                    backgroundColor: "rgba(75, 192, 75, 0.7)", // Green
                },
                {
                    label: "High",
                    data: [
                        nikeData[nikeData.length - 1]?.high || 0,
                        skechersData[skechersData.length - 1]?.high || 0,
                    ],
                    backgroundColor: "rgba(54, 162, 235, 0.7)", // Blue
                },
                {
                    label: "Low",
                    data: [
                        nikeData[nikeData.length - 1]?.low || 0,
                        skechersData[skechersData.length - 1]?.low || 0,
                    ],
                    backgroundColor: "rgba(192, 75, 75, 0.7)", // Red
                },
            ],
        };
        
        
        

        const stackedAreaChartData = (companyData, forecastData, color, borderColor) => ({
            datasets: [
                {
                    label: "Actual",
                    data: companyData.map((d) => ({ x: formatDate(d.timestamp), y: d[priceType] })),
                    backgroundColor: color,
                    borderColor: borderColor,
                    borderWidth: 2,
                    fill: true,
                    pointRadius: 0,
                },
                {
                    label: "Forecast",
                    data: forecastData.map((d) => ({ x: formatDate(d.timestamp), y: d[priceType] })),
                    backgroundColor: color,
                    borderColor: "rgba(0, 0, 0, 0.5)",
                    borderWidth: 1,
                    borderDash: [5, 5],
                    fill: true,
                    pointRadius: 0,
                },
            ],
        });

        return { lineChartData, barChartData, nikeData, skechersData, nikeForecast, skechersForecast, stackedAreaChartData };
    };

const renderDashboard = (data, forecast) => {
    const { lineChartData, barChartData, nikeData, skechersData, nikeForecast, skechersForecast, stackedAreaChartData } = getChartData(data, forecast);

    return (
        <div style={{ display: "grid", gridTemplateRows: "5fr 5fr", gap: "20px" }}>
            <div style={{ display: "flex", gap: "20px", alignItems: "center", height: "100%" }}>
                <div style={{ flex: 5, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                    <h3 style={{ textAlign: "center", marginBottom: "10px", color: "#333" }}>Nike vs. Skechers: Stock Prices Over Time</h3>
                    <Line data={lineChartData} />
                </div>
                <div style={{ flex: 5, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                    <h3 style={{ textAlign: "center", marginBottom: "10px", color: "#333" }}>Nike vs. Skechers: Latest Stock Prices</h3>
                    <Bar
                        data={barChartData}
                        options={{
                            plugins: {
                                legend: {
                                    display: true,
                                    position: "top",
                                    labels: {
                                        usePointStyle: true,
                                    },
                                },
                            },
                            responsive: true,
                            scales: {
                                x: {
                                    stacked: false,
                                },
                                y: {
                                    beginAtZero: true,
                                },
                            },
                        }}
                    />
                </div>
            </div>
            <div style={{ display: "flex", gap: "20px", alignItems: "center", height: "100%" }}>
                <div style={{ flex: 4, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                    <h3 style={{ textAlign: "center", marginBottom: "10px", color: "#333" }}>Nike Prices Over Time</h3>
                    <Line data={stackedAreaChartData(nikeData, nikeForecast, "rgba(75, 192, 192, 0.3)", "rgba(75, 192, 192, 1)")} />
                </div>
                <div style={{ flex: 4, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                    <h3 style={{ textAlign: "center", marginBottom: "10px", color: "#333" }}>Skechers Prices Over Time</h3>
                    <Line data={stackedAreaChartData(skechersData, skechersForecast, "rgba(128, 75, 192, 0.3)", "rgba(128, 75, 192, 1)")} />
                </div>
                <div style={{ flex: 2, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                    <p>
                        <span style={{ fontSize: "1.2em", fontWeight: "bold", color: "#333" }}>All Time Average Nike Price</span>
                        <br />
                        <span style={{ fontSize: "4em", color: "#333" }}>${calculateAverage(data, "NIKE")}</span>
                    </p>
                    <p>
                        <span style={{ fontSize: "1.2em", fontWeight: "bold", color: "#333" }}>All Time Average Skechers Price</span>
                        <br />
                        <span style={{ fontSize: "4em", color: "#333" }}>${calculateAverage(data, "SKECHERS")}</span>
                    </p>
                </div>
            </div>
        </div>
    );
};
    return (
        <div style={{ padding: "20px", color: "#333" }}>
    <h1>Stock Visualization Dashboard</h1>
    <Tabs selectedIndex={tabIndex} onSelect={(index) => setTabIndex(index)}>
        <TabList>
            <Tab style={{ fontWeight: "bold", fontSize: "20px", padding: "5px 10px" }}>Historical Data</Tab>
            <Tab style={{ fontWeight: "bold", fontSize: "20px", padding: "5px 10px" }}>Real-Time Data</Tab>
        </TabList>
        <TabPanel>
    <div style={{ marginTop: "20px", display: "flex", alignItems: "center", gap: "20px" }}>
        <div>
            <label style={{ fontWeight: "bold" }}>Time Range: </label>
            <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                style={{
                    padding: "5px 10px",
                    fontSize: "14px",
                    border: "1px solid #ccc",
                    borderRadius: "5px",
                    backgroundColor: "#f9f9f9",
                    cursor: "pointer",
                }}
            >
                <option value="YEAR">Year</option>
                <option value="MONTH">Month</option>
                <option value="WEEK">Week</option>
            </select>
        </div>
        <div>
            <label style={{ fontWeight: "bold" }}>Price Type: </label>
            <select
                value={priceType}
                onChange={(e) => setPriceType(e.target.value)}
                style={{
                    padding: "5px 10px",
                    fontSize: "14px",
                    border: "1px solid #ccc",
                    borderRadius: "5px",
                    backgroundColor: "#f9f9f9",
                    cursor: "pointer",
                }}
            >
                <option value="open">Open</option>
                <option value="close">Close</option>
                <option value="high">High</option>
                <option value="low">Low</option>
            </select>
        </div>
    </div>
    {renderDashboard(historyData, forecastData)}
</TabPanel>

        <TabPanel>
    <div style={{ marginTop: "20px", display: "flex", alignItems: "center", gap: "20px" }}>
        <div>
            <label style={{ fontWeight: "bold" }}>Time Range: </label>
            <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                style={{
                    padding: "5px 10px",
                    fontSize: "14px",
                    border: "1px solid #ccc",
                    borderRadius: "5px",
                    backgroundColor: "#f9f9f9",
                    cursor: "pointer",
                }}
            >
                <option value="YEAR">Year</option>
                <option value="MONTH">Month</option>
                <option value="WEEK">Week</option>
            </select>
        </div>
        <div>
            <label style={{ fontWeight: "bold" }}>Price Type: </label>
            <select
                value={priceType}
                onChange={(e) => setPriceType(e.target.value)}
                style={{
                    padding: "5px 10px",
                    fontSize: "14px",
                    border: "1px solid #ccc",
                    borderRadius: "5px",
                    backgroundColor: "#f9f9f9",
                    cursor: "pointer",
                }}
            >
                <option value="open">Open</option>
                <option value="close">Close</option>
                <option value="high">High</option>
                <option value="low">Low</option>
            </select>
        </div>
    </div>
    {renderDashboard(realtimeData, forecastData)}
</TabPanel>

    </Tabs>
</div>
    );
};

const rootElement = document.getElementById("app");
const root = ReactDOM.createRoot(rootElement);
root.render(<App />);

export default App;

