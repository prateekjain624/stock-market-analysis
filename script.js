document.addEventListener("DOMContentLoaded", () => {
  const Stocks = [
    "AAPL",
    "MSFT",
    "GOOGL",
    "AMZN",
    "PYPL",
    "TSLA",
    "JPM",
    "NVDA",
    "NFLX",
    "DIS",
  ];

  let st = "AAPL";
  let period = "5y";

  async function renderlist() {
    try {
      const response = await fetch(
        "https://stocks3.onrender.com/api/stocks/getstockstatsdata"
      );
      const data = await response.json();
      // console.log(data.stocksStatsData);

      const stockData = data.stocksStatsData[0];

      const stockEl = document.getElementById("stock-list");

      Stocks.forEach((stock, index) => {
        setTimeout(() => {
          const stockList = document.createElement("div");

          const stockbtn = document.createElement("button");
          stockbtn.classList.add("list");
          stockbtn.textContent = stock;
          stockbtn.value = stock;

          const bookValue = document.createElement("span");
          bookValue.textContent = `$${stockData[stock].bookValue}`;

          const stockProfit = document.createElement("span");
          stockProfit.textContent = `${stockData[stock].profit.toFixed(2)}%`;
          if (stockData[stock].profit.toFixed(2) > 0) {
            stockProfit.setAttribute("style", "color: green");
          } else {
            stockProfit.setAttribute("style", "color: red");
          }

          stockbtn.addEventListener("click", () => {
            st = stock;
            getSummary(
              stockbtn.value,
              stockData[stock].bookValue,
              stockData[stock].profit.toFixed(2)
            );
            Showchart(st, period);
          });

          stockList.appendChild(stockbtn);
          stockList.appendChild(bookValue);
          stockList.appendChild(stockProfit);

          stockEl.appendChild(stockList);
        }, index * 1000);
      });

      const defaultbookValue = stockData["AAPL"].bookValue;
      const defaultProfit = stockData["AAPL"].profit;

      getSummary("", defaultbookValue, defaultProfit);
      Showchart("");
    } catch (err) {
      console.log(err);
    }
  }

  async function getSummary(value, bookValue, profit) {
    const response = await fetch(
      "https://stocks3.onrender.com/api/stocks/getstocksprofiledata"
    );
    const Data = await response.json();

    const summary = document.getElementById("summary");
    const summarydiv = document.createElement("div");

    const summaryData0 = Data.stocksProfileData[0];
    const summaryData1 = summaryData0["AAPL"].summary;

    if (value === "") {
      const stockName = document.createElement("span");
      stockName.setAttribute("id", "name");
      stockName.textContent = "AAPL";
      const summaryPara = document.createElement("p");
      summaryPara.textContent = summaryData1;
      const bookValuespan = document.createElement("span");
      bookValuespan.setAttribute("id", "bookvalue");
      bookValuespan.textContent = `$${bookValue}`;
      const profitspan = document.createElement("span");
      profitspan.setAttribute("id", "profit");
      profitspan.textContent = `${profit}%`;

      summarydiv.appendChild(stockName);
      summarydiv.appendChild(profitspan);
      summarydiv.appendChild(bookValuespan);
      summarydiv.appendChild(summaryPara);

      summary.appendChild(summarydiv);
    } else {
      summary.innerHTML = "";
      const stockName = document.createElement("span");
      stockName.setAttribute("id", "name");
      stockName.textContent = value;
      const summaryPara = document.createElement("p");
      summaryPara.textContent = summaryData0[value].summary;
      const bookValuespan = document.createElement("span");
      bookValuespan.setAttribute("id", "bookvalue");
      bookValuespan.textContent = `$${bookValue}`;
      const profitspan = document.createElement("span");
      profitspan.setAttribute("id", "profit");
      profitspan.textContent = `${profit}%`;

      summarydiv.appendChild(stockName);
      summarydiv.appendChild(profitspan);
      summarydiv.appendChild(bookValuespan);
      summarydiv.appendChild(summaryPara);

      summary.appendChild(summarydiv);
    }
  }

  document.getElementById("btn1mo").addEventListener("click", () => {
    Showchart(st, "1mo");
  });

  document.getElementById("btn3mo").addEventListener("click", () => {
    Showchart(st, "3mo");
  });

  document.getElementById("btn1y").addEventListener("click", () => {
    Showchart(st, "1y");
  });

  document.getElementById("btn5y").addEventListener("click", () => {
    Showchart(st, "5y");
  });

  async function Showchart(value, period) {
    const url = "https://stocks3.onrender.com/api/stocks/getstocksdata";

    const response = await fetch(url);

    const result = await response.json();
    // console.log(result);

    if (value === "") {
      let stockData1 = result.stocksData[0];
      const stockData = stockData1.AAPL["5y"];
      let labels = stockData.timeStamp;
      let chartData = stockData.value;

      // console.log(labels);
      // console.log(chartData);

      labels = labels.map((timestamp) =>
        new Date(timestamp * 1000).toLocaleDateString()
      );

      drawchart(chartData, labels, "AAPL");
    } else {
      let stockData2 = result.stocksData[0];
      let stockData = stockData2[value][period];
      let labels = stockData.timeStamp; //date
      let chartData = stockData.value; // price

      // console.log(labels);
      // console.log(chartData);

      labels = labels.map((timestamp) =>
        new Date(timestamp * 1000).toLocaleDateString()
      );

      drawchart(chartData, labels, st);
    }
  }

  function drawchart(data, labels, stockName) {
    // console.log(data);
    // console.log(labels);
    const canvas = document.getElementById("myChart");
    const ctx = canvas.getContext("2d");
    const chartHeight = canvas.height - 40;
    const chartWidth = canvas.width - 60;
    const dataMax = Math.max(...data);
    const dataMin = Math.min(...data);
    const dataRange = dataMax - dataMin;
    const dataStep = dataRange > 0 ? chartHeight / dataRange : 0;
    const stepX = chartWidth / (data.length - 1);
    // Clear the canvas at the beginning
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw the chart
    ctx.beginPath();
    ctx.moveTo(0, chartHeight - (data[0] - dataMin) * dataStep);
    for (let i = 1; i < data.length; i++) {
      ctx.lineTo(i * stepX, chartHeight - (data[i] - dataMin) * dataStep);
    }
    ctx.strokeStyle = "#39FF14";
    ctx.lineWidth = 2;
    ctx.stroke();
    // Draw a dotted horizontal line for value 0
    ctx.beginPath();
    ctx.setLineDash([2, 2]);
    const zeroY = chartHeight - (0 - dataMin) * dataStep;
    ctx.moveTo(0, zeroY);
    ctx.lineTo(canvas.width, zeroY);
    ctx.strokeStyle = "#ccc";
    ctx.stroke();
    ctx.setLineDash([]); // Reset the line dash

    const minValue = document.getElementById("stockMin");
    minValue.textContent = `Low Value:${dataMin.toFixed(2)}`;
    const maxValue = document.getElementById("stockMax");
    maxValue.textContent = `Peak Value:${dataMax.toFixed(2)}`;
    // Show tooltip and x-axis value on hover
    const tooltip = document.getElementById("tooltip");
    const xAxisLabel = document.getElementById("xAxisLabel");
    canvas.addEventListener("mousemove", (event) => {
      const x = event.offsetX;
      const y = event.offsetY;
      const dataIndex = Math.min(Math.floor(x / stepX), data.length - 1); // Ensure not to go out of bounds
      const stockValue = data[dataIndex].toFixed(2);
      const xAxisValue = labels[dataIndex];
      tooltip.style.display = "block";
      tooltip.style.left = `${x + 10}px`;
      tooltip.style.top = `${y - 30}px`;
      tooltip.textContent = `${stockName}: $${stockValue}`;
      xAxisLabel.style.display = "block";
      xAxisLabel.style.fontSize = "14px";
      xAxisLabel.style.fontWeight = "bolder";
      xAxisLabel.style.left = `${x}px`;
      xAxisLabel.textContent = xAxisValue;
      ctx.clearRect(0, 0, canvas.width, chartHeight);
      ctx.clearRect(
        0,
        chartHeight + 20,
        canvas.width,
        canvas.height - chartHeight - 20
      );
      // Draw the chart
      ctx.beginPath();
      ctx.moveTo(0, chartHeight - (data[0] - dataMin) * dataStep);
      for (let i = 1; i < data.length; i++) {
        ctx.lineTo(i * stepX, chartHeight - (data[i] - dataMin) * dataStep);
      }
      ctx.strokeStyle = "#39FF14";
      ctx.lineWidth = 2;
      ctx.stroke();
      // Draw the dotted horizontal line for value 0
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, chartHeight);
      ctx.strokeStyle = "#ccc";
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(
        x,
        chartHeight - (data[dataIndex] - dataMin) * dataStep,
        6,
        0,
        2 * Math.PI
      );
      ctx.fillStyle = "#39FF14";
      ctx.fill();
    });
    canvas.addEventListener("mouseout", () => {
      tooltip.style.display = "none";
      xAxisLabel.style.display = "none";
      // ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawchart(data, labels, stockName);
    });
  }

  renderlist();
});
