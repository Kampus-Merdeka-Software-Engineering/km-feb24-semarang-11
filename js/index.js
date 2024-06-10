
// Mengambil data dari file JSON
fetch("DataNYC1.json")
    .then((res) => {
        if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
    })

    .then((data) => {
        
        // Fungsi untuk memproses data JSON dan menghitung total harga penjualan berdasarkan borough
        function processBoroughData(data) {
            return data.reduce((acc, { BOROUGH, SALE_PRICE }) => {
                acc[BOROUGH] = (acc[BOROUGH] || 0) + parseFloat(SALE_PRICE) || 0;
                return acc;
            }, {});
        }

        // Fungsi untuk mengonversi tanggal ke format bulan-tahun
        function getMonthYear(dateStr) {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        }

         // Fungsi untuk memformat angka menjadi notasi singkat
        function formatNumber(value) {
            if (value >= 1e9) {
                return '$' + Math.round(value / 1e9) + 'B';
            } else if (value >= 1e6) {
                return '$' + Math.round(value / 1e6) + 'M';
            } else if (value >= 1e3) {
                return '$' + Math.round(value / 1e3) + 'K';
            }
            return '$' + value.toLocaleString(); 
        }

        // Fungsi untuk memformat angka
        function formatNumber1(value) {
            return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });
        }

        // Menghitung total unit komersial, unit residensial, total penjualan, dan total unit
        let totals = data.reduce((acc, item) => {
            acc.totalCommercialUnit += parseInt(item.COMMERCIAL_UNITS) || 0;
            acc.totalResidentialUnit += parseInt(item.RESIDENTIAL_UNITS) || 0;
            acc.totalSalesPrice += parseFloat(item.SALE_PRICE) || 0;
            acc.totalUnits += parseInt(item.TOTAL_UNITS) || 0;
            return acc;
        }, { totalCommercialUnit: 0, totalResidentialUnit: 0, totalSalesPrice: 0, totalUnits: 0 });

        // Memperbarui elemen HTML dengan hasil perhitungan
        document.getElementById('total-commercial-unit').textContent = totals.totalCommercialUnit.toLocaleString();
        document.getElementById('total-residential-unit').textContent = totals.totalResidentialUnit.toLocaleString();
        document.getElementById('total-sales-price').textContent = formatNumber1(totals.totalSalesPrice);
        document.getElementById('total-units').textContent = totals.totalUnits.toLocaleString();

        // Memproses data untuk total harga penjualan berdasarkan borough
        const salesDataByBorough = processBoroughData(data);
        const boroughs = Object.keys(salesDataByBorough);
        const totalSalesPrices = Object.values(salesDataByBorough);

        // Membuat bar chart
        new Chart(document.getElementById('totalSalesChart').getContext('2d'), {
            type: 'bar',
            data: {
                labels: boroughs,
                datasets: [{
                    label: 'Total Sale Price',
                    data: totalSalesPrices,
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: value => formatNumber(value)
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: context => 'Total Sale Price: ' + formatNumber(context.parsed.y)
                        }
                    }
                }
            }
        });

        // Menginisialisasi objek untuk menyimpan data penjualan per bulan
        const salesDataByMonth = data.reduce((acc, sale) => {
            const saleDate = getMonthYear(sale.SALE_DATE);
            if (!acc[saleDate]) {
                acc[saleDate] = { units: 0, price: 0, residential: 0, commercial: 0 };
            }
            acc[saleDate].units += parseFloat(sale.TOTAL_UNITS) || 0;
            acc[saleDate].price += parseFloat(sale.SALE_PRICE) || 0;
            acc[saleDate].residential += parseFloat(sale.RESIDENTIAL_UNITS) || 0;
            acc[saleDate].commercial += parseFloat(sale.COMMERCIAL_UNITS) || 0;
            return acc;
        }, {});

        // Memastikan semua bulan dari September 2016 hingga Agustus 2017 ada dalam data
        const months = Array.from({ length: 12 }, (_, i) => new Date(2016, 8 + i).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }));

        months.forEach(month => {
            if (!salesDataByMonth[month]) {
                salesDataByMonth[month] = { units: 0, price: 0, residential: 0, commercial: 0 };
            }
        });

        const unitsSold = months.map(month => salesDataByMonth[month].units);
        const salePrices = months.map(month => salesDataByMonth[month].price);
        const residentialUnits = months.map(month => salesDataByMonth[month].residential);
        const commercialUnits = months.map(month => salesDataByMonth[month].commercial);

        // Membuat line chart untuk total unit terjual
        new Chart(document.getElementById('unitsSoldChart').getContext('2d'), {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    label: 'Total Units Sold',
                    data: unitsSold,
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        // Membuat line chart untuk total harga penjualan
        new Chart(document.getElementById('salePriceChart').getContext('2d'), {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    label: 'Total Sale Price',
                    data: salePrices,
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: value => formatNumber(value)
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: context => context.dataset.label + ': ' + formatNumber(context.raw)
                        }
                    }
                }
            }
        });

        // Memproses data untuk LAND_SQUARE_FEET dan GROSS_SQUARE_FEET per bulan
        const landGrossSquareFeetByPeriod = data.reduce((acc, entry) => {
            const period = getMonthYear(entry.SALE_DATE);
            acc[period] = acc[period] || { land: 0, gross: 0 };
            acc[period].land += parseFloat(entry.LAND_SQUARE_FEET) || 0;
            acc[period].gross += parseFloat(entry.GROSS_SQUARE_FEET) || 0;
            return acc;
        }, {});

        months.forEach(month => {
            if (!landGrossSquareFeetByPeriod[month]) {
                landGrossSquareFeetByPeriod[month] = { land: 0, gross: 0 };
            }
        });

        const landSquareFeetData = months.map(month => landGrossSquareFeetByPeriod[month].land);
        const grossSquareFeetData = months.map(month => landGrossSquareFeetByPeriod[month].gross);

        // Membuat line chart untuk LAND_SQUARE_FEET vs GROSS_SQUARE_FEET
        new Chart(document.getElementById('landVsGrossSquareFeetChart').getContext('2d'), {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    label: 'Land Square Feet',
                    data: landSquareFeetData,
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }, {
                    label: 'Gross Square Feet',
                    data: grossSquareFeetData,
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        // Memproses data untuk total unit berdasarkan kelas pajak
        const unitsByTaxClass = data.reduce((acc, entry) => {
            const taxClass = entry.TAX_CLASS_AT_TIME_OF_SALE;
            acc[taxClass] = (acc[taxClass] || 0) + parseInt(entry.TOTAL_UNITS) || 0;
            return acc;
        }, {});

        const taxClasses = Object.keys(unitsByTaxClass);
        const totalUnitsByTaxClass = Object.values(unitsByTaxClass);

        // Membuat pie chart
        new Chart(document.getElementById('taxClassPieChart').getContext('2d'), {
            type: 'pie',
            data: {
                labels: taxClasses,
                datasets: [{
                    label: 'Total Units by Tax Class',
                    data: totalUnitsByTaxClass,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: context => {
                                const total = context.dataset.data.reduce((sum, value) => sum + value, 0);
                                const percentage = ((context.raw / total) * 100).toFixed(2);
                                return `${context.label}: ${context.raw.toLocaleString()} (${percentage}%)`;
                            }
                        }
                    },
                    datalabels: {
                        formatter: (value, context) => {
                            const total = context.dataset.data.reduce((sum, value) => sum + value, 0);
                            const percentage = ((value / total) * 100).toFixed(2);
                            return `${percentage}%`;
                        },
                        color: 'black',
                        font: {
                            weight: 'bold'
                        }
                    }
                }
            },
            plugins: [ChartDataLabels]
        });


        // Fungsi untuk memproses data berdasarkan kunci yang diberikan dan menghitung total berdasarkan kunci tersebut
        function processDataByKey(data, key, valueKey) {
            return data.reduce((acc, entry) => {
                const keyValue = entry[key];
                const value = parseFloat(entry[valueKey]) || 0;
                acc[keyValue] = (acc[keyValue] || 0) + value;
                return acc;
            }, {});
        }

        // Fungsi untuk membuat chart horizontal bar
        function createHorizontalBarChart(ctx, labels, data, label) {
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: label,
                        data: data,
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                autoSkip: false
                            }
                        },
                        x: {
                            ticks: {
                                callback: function (value) {
                                    return formatNumber(value);
                                }
                            }
                        }
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function (context) {
                                    return context.label + ': ' + formatNumber(context.raw);
                                }
                            }
                        }
                    }
                }
            });
        }

        // Fungsi untuk mengonversi objek ke array dan mengurutkan berdasarkan nilai
        function sortAndSliceData(obj, sliceCount = 10) {
            return Object.entries(obj)
                .sort(([, a], [, b]) => b - a)
                .slice(0, sliceCount)
                .reduce((acc, [key, value]) => {
                    acc.keys.push(key);
                    acc.values.push(value);
                    return acc;
                }, { keys: [], values: [] });
        }

        // Chart 6: Sale Price by Building Class at Time of Sale
        const salePriceByBuildingClass = processDataByKey(data, 'BUILDING_CLASS_AT_TIME_OF_SALE', 'SALE_PRICE');
        const sortedBuildingClassData = sortAndSliceData(salePriceByBuildingClass);
        createHorizontalBarChart(
            document.getElementById('salePriceByBuildingClassChart').getContext('2d'),
            sortedBuildingClassData.keys,
            sortedBuildingClassData.values,
            'Total Sale Price by Building Class'
        );

        // Chart 7: Residential and Commercial Units by Month
        const unitsByTypeCtx = document.getElementById('unitsByTypeChart').getContext('2d');
        new Chart(unitsByTypeCtx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [
                    {
                        label: 'Residential Units',
                        data: residentialUnits,
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Commercial Units',
                        data: commercialUnits,
                        backgroundColor: 'rgba(153, 102, 255, 0.2)',
                        borderColor: 'rgba(153, 102, 255, 1)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        // Chart 8: Total Units by Year Built
        const unitsByYearBuilt = processDataByKey(data, 'YEAR_BUILT', 'TOTAL_UNITS');
        const sortedYearBuiltData = sortAndSliceData(unitsByYearBuilt);
        createHorizontalBarChart(
            document.getElementById('yearBuiltUnitsChart').getContext('2d'),
            sortedYearBuiltData.keys,
            sortedYearBuiltData.values,
            'Total Units by Year Built'
        );


        //TABEL

        //TABEL

        var array = [];
        var array_length = 0;
        var table_size = 20;
        var start_index = 1;
        var end_index = 0;
        var current_index = 1;
        var max_index = 0;
        let filteredData = [];
        let currentPage = 1;
        const pageSize = 100;

        function reload() {
            location.reload();
        }

        function preLoadCalculation() {
            array = data;
            array_length = array.length;
            max_index = Math.ceil(array_length / table_size);
        }

        function sorting() {
            const sortKey = document.getElementById("sort-key").value;
            if (sortKey === "borough") {
                data.sort((a, b) => a.BOROUGH - b.BOROUGH);
            } else if (sortKey === "sale price") {
                data.sort((a, b) => a.SALE_PRICE - b.SALE_PRICE);
            } else if (sortKey === "sale date") {
                data.sort((a, b) => new Date(a.SALE_DATE) - new Date(b.SALE_DATE));
            } else {
                alert("Anda Harus Memilih Kategori");
                location.reload();
            }
            displayTable();
        }

        function filter() {
            const filterKey = document.getElementById("filter-key").value;
            const filterValue = document.getElementById("filter-value").value;
            const filterMonth = filterValue.padStart(2, "0");

            if (filterValue === "") {
                alert("Anda harus memasukkan kata kunci");
                location.reload();
                return;
            } else if (filterKey === "sale month" && isNaN(Number(filterValue))) {
                alert("Kata Kunci yang dimasukkan Harus Angka");
                location.reload();
                return;
            }

            switch (filterKey) {
                case "borough":
                    filteredData = data.filter(item => item.BOROUGH.toString().toLowerCase() === filterValue.toLowerCase());
                    break;
                case "building class category":
                    filteredData = data.filter(item => item.BUILDING_CLASS_CATEGORY.toLowerCase().includes(filterValue.toLowerCase()));
                    break;
                case "sale month":
                    filteredData = data.filter(item => {
                        const saleDate = new Date(item.SALE_DATE);
                        const saleMonth = (saleDate.getMonth() + 1).toString().padStart(2, "0");
                        return saleMonth === filterMonth;
                    });
                    break;
                default:
                    alert("Anda Harus memilih kategori");
                    location.reload();
                    return;
            }

            currentPage = 1;
            updateTable(filteredData);
            updatePaginationButtons(filteredData.length);
        }

        function updateTable(data) {
            const table = document.getElementById("data-table");
            const oldTbody = table.querySelector("tbody");
            if (oldTbody) table.removeChild(oldTbody);

            const newTbody = document.createElement("tbody");

            const startIndex = (currentPage - 1) * pageSize;
            const endIndex = Math.min(startIndex + pageSize, data.length);

            data.slice(startIndex, endIndex).forEach(item => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${item["BOROUGH"]}</td>
                    <td>${item["NEIGHBORHOOD"]}</td>
                    <td>${item["BUILDING_CLASS_CATEGORY"]}</td>
                    <td>${item["RESIDENTIAL_UNITS"]}</td>
                    <td>${item["COMMERCIAL_UNITS"]}</td>
                    <td>${item["TOTAL_UNITS"]}</td>
                    <td>${item["LAND_SQUARE_FEET"]}</td>
                    <td>${item["GROSS_SQUARE_FEET"]}</td>
                    <td>${item["YEAR_BUILT"]}</td>
                    <td>${item["TAX_CLASS_AT_TIME_OF_SALE"]}</td>
                    <td>${item["BUILDING_CLASS_AT_TIME_OF_SALE"]}</td>
                    <td>${item["SALE_PRICE"]}</td>
                    <td>${item["SALE_DATE"]}</td>
                `;
                newTbody.appendChild(row);
            });

            table.appendChild(newTbody);
        }

        function updatePaginationButtons(totalItems) {
            const indexButtonsContainer = document.querySelector(".index_button");
            indexButtonsContainer.innerHTML = "";

            const totalPages = Math.ceil(totalItems / pageSize);
            const maxVisibleButtons = 5;

            const createButton = (text, disabled, onClick) => {
                const button = document.createElement("button");
                button.textContent = text;
                button.disabled = disabled;
                button.addEventListener("click", onClick);
                return button;
            };

            const appendButton = (text, page) => {
                const button = createButton(text, currentPage === page, () => {
                    currentPage = page;
                    updateTable(filteredData);
                    updatePaginationButtons(filteredData.length);
                });
                indexButtonsContainer.appendChild(button);
            };

            const prevButton = createButton("Prev", currentPage === 1, () => {
                if (currentPage > 1) {
                    currentPage--;
                    updateTable(filteredData);
                    updatePaginationButtons(filteredData.length);
                }
            });
            indexButtonsContainer.appendChild(prevButton);

            let startPage = Math.max(1, currentPage - Math.floor(maxVisibleButtons / 2));
            let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);

            if (startPage > 1) {
                appendButton("1", 1);
                if (startPage > 2) {
                    const ellipsis = document.createElement("span");
                    ellipsis.textContent = "...";
                    indexButtonsContainer.appendChild(ellipsis);
                }
            }

            for (let i = startPage; i <= endPage; i++) {
                appendButton(i, i);
            }

            if (endPage < totalPages) {
                if (endPage < totalPages - 1) {
                    const ellipsis = document.createElement("span");
                    ellipsis.textContent = "...";
                    indexButtonsContainer.appendChild(ellipsis);
                }
                appendButton(totalPages, totalPages);
            }

            const nextButton = createButton("Next", currentPage === totalPages, () => {
                if (currentPage < totalPages) {
                    currentPage++;
                    updateTable(filteredData);
                    updatePaginationButtons(filteredData.length);
                }
            });
            indexButtonsContainer.appendChild(nextButton);
        }

        function displayIndexButtons() {
            preLoadCalculation();
            const indexButtonsContainer = document.querySelector(".index_button");
            indexButtonsContainer.innerHTML = "";

            const prevButton = document.createElement("button");
            prevButton.textContent = "Prev";
            prevButton.addEventListener("click", prevIndex);
            indexButtonsContainer.appendChild(prevButton);

            for (let i = 1; i <= max_index; i++) {
                const indexButton = document.createElement("button");
                indexButton.textContent = i;
                indexButton.setAttribute("data-index", i);
                indexButton.addEventListener("click", function () {
                    current_index = this.getAttribute("data-index");
                    indexPagination(current_index);
                });
                indexButtonsContainer.appendChild(indexButton);
            }

            const nextButton = document.createElement("button");
            nextButton.textContent = "Next";
            nextButton.addEventListener("click", nextIndex);
            indexButtonsContainer.appendChild(nextButton);
            highlightIndex();
        }

        function highlightIndex() {
            start_index = (current_index - 1) * table_size + 1;
            end_index = start_index + table_size - 1;
            if (end_index > array_length) end_index = array_length;

            document.getElementById("go-to-page-button").addEventListener("click", () => {
                const pageNumber = parseInt(document.getElementById("page-number").value);
                if (pageNumber >= 1 && pageNumber <= max_index) {
                    current_index = pageNumber;
                    indexPagination(current_index);
                    highlightIndex();
                } else {
                    alert("Nomor halaman tidak valid.");
                }
            });

            const indexButtons = document.querySelectorAll(".index_button button");
            indexButtons.forEach(button => button.classList.remove("active"));

            const activeButton = document.querySelector(`.index_button button[data-index="${current_index}"]`);
            if (activeButton) activeButton.classList.add("active");
        }

        function indexPagination(index) {
            current_index = index;
            highlightIndex();
            displayTable();
        }

        function prevIndex() {
            if (current_index > 1) {
                current_index--;
                indexPagination(current_index);
            }
        }

        function nextIndex() {
            if (current_index < max_index) {
                current_index++;
                indexPagination(current_index);
            }
        }

        function displayTable() {
            start_index = (current_index - 1) * table_size + 1;
            end_index = start_index + table_size - 1;
            if (end_index > array_length) end_index = array_length;

            const tableData = array.slice(start_index - 1, end_index);

            const tableBody = document.getElementById("data-table-body");
            tableBody.innerHTML = "";
            tableData.forEach(item => {
                const row = document.createElement("tr");
                const salePrice = formatNumber(item.SALE_PRICE);
                row.innerHTML = `
                    <td>${item.BOROUGH}</td>
                    <td>${item.NEIGHBORHOOD}</td>
                    <td>${item.BUILDING_CLASS_CATEGORY}</td>
                    <td>${item.RESIDENTIAL_UNITS}</td>
                    <td>${item.COMMERCIAL_UNITS}</td>
                    <td>${item.TOTAL_UNITS}</td>
                    <td>${item.LAND_SQUARE_FEET}</td>
                    <td>${item.GROSS_SQUARE_FEET}</td>
                    <td>${item.YEAR_BUILT}</td>
                    <td>${item.TAX_CLASS_AT_TIME_OF_SALE}</td>
                    <td>${item.BUILDING_CLASS_AT_TIME_OF_SALE}</td>
                    <td>${salePrice}</td>
                    <td>${item.SALE_DATE}</td>
                `;
                tableBody.appendChild(row);
            });
        }

        displayIndexButtons();
        displayTable();

        document.getElementById("sort-button").addEventListener("click", sorting);
        document.getElementById("filter-button").addEventListener("click", filter);
        document.getElementById("reload-button").addEventListener("click", reload);
    })
    
    .catch((error) => {
        console.error("Error:", error);
    });
