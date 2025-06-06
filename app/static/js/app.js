// Полный JavaScript файл для управления CRM системой
document.addEventListener('DOMContentLoaded', () => {
    // Глобальные переменные
    const currentDate = new Date().toISOString().split('T')[0];
    let activeTab = 'cash';

    // Объект с содержимым всех вкладок
    const tabsContent = {
        cash: `
            <div class="container">
                <div class="block form-block">
                    <h2>Наличные</h2>
                    <form id="cashForm">
                        <label>Дата:</label>
                        <input type="date" id="cashDate" required>
                        <label>Время:</label>
                        <input type="time" id="cashTime" required>
                        <label>Марка авто:</label>
                        <input type="text" id="cashCarBrand" list="car-brands" placeholder="Выберите или введите марку авто" required>
                        <datalist id="car-brands"></datalist>
                        <label>Гос номер:</label>
                        <input type="text" id="cashCarNumber" list="car-numbers" placeholder="Введите гос номер" required>
                        <datalist id="car-numbers"></datalist>
                        <label>Товар:</label>
                        <input type="text" id="cashProduct" list="products" placeholder="Выберите или введите товар" required>
                        <datalist id="products">
                            <option>Клинец</option>
                            <option>Щебень</option>
                            <option>Компот</option>
                            <option>Песок</option>
                            <option>Отход</option>
                            <option>Другие</option>
                        </datalist>
                        <label>Объём, м3:</label>
                        <input type="number" id="cashVolume" placeholder="Введите объём" step="0.01" min="0" required>
                        <label>Сумма:</label>
                        <input type="number" id="cashAmount" placeholder="Введите сумму" step="0.01" min="0" required>
                        <label>Комментарий:</label>
                        <textarea id="cashComment" rows="3" placeholder="Комментарий"></textarea>
                        <button type="submit">Сохранить</button>
                    </form>
                </div>
                <div class="block history-block">
                    <div class="history-header">
                        <h2>История продаж</h2>
                        <input type="date" id="cashDateFilter">
                        <button id="exportCashBtn" class="export-btn">Экспорт в Excel</button>
                    </div>
                    <table class="cash-sales-table">
                        <thead>
                            <tr>
                                <th>№</th>
                                <th>Дата</th>
                                <th>Время</th>
                                <th>Марка авто</th>
                                <th>Гос номер</th>
                                <th>Товар</th>
                                <th>Объём</th>
                                <th>Сумма</th>
                                <th>Комментарий</th>
                            </tr>
                        </thead>
                        <tbody id="cashSalesBody"></tbody>
                        <tfoot>
                            <tr>
                                <td colspan="6" style="text-align:right;"><strong>Итого:</strong></td>
                                <td id="cashTotalVolume">0</td>
                                <td id="cashTotalAmount">0</td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        `,
        clients: `
            <div class="container">
                <div class="block form-block">
                    <h2>Крупным клиентам</h2>
                    <form id="clientForm">
                        <label>Дата:</label>
                        <input type="date" id="clientDate" required>
                        <label>Время:</label>
                        <input type="time" id="clientTime" required>
                        <label>Контрагент:</label>
                        <input type="text" id="clientCounterparty" list="counterparties" placeholder="Выберите или введите контрагента" required>
                        <datalist id="counterparties">
                            <option>Light print service MCHJ</option>
                            <option>Oazis mega construkctions</option>
                        </datalist>
                        <label>Марка авто:</label>
                        <input type="text" id="clientCarBrand" list="car-brands" placeholder="Выберите или введите марку авто" required>
                        <label>Гос номер:</label>
                        <input type="text" id="clientCarNumber" placeholder="Введите гос номер" required>
                        <label>Товар:</label>
                        <input type="text" id="clientProduct" list="products" placeholder="Выберите или введите товар" required>
                        <label>Объём, м3:</label>
                        <input type="number" id="clientVolume" placeholder="Введите объём" step="0.01" min="0" required>
                        <label>Сумма:</label>
                        <input type="number" id="clientAmount" placeholder="Введите сумму" step="0.01" min="0" required>
                        <label>Комментарий:</label>
                        <textarea id="clientComment" rows="3" placeholder="Комментарий"></textarea>
                        <button type="submit">Сохранить</button>
                    </form>
                </div>
                <div class="block history-block">
                    <div class="history-header">
                        <h2>История продаж</h2>
                        <input type="date" id="clientDateFilter">
                        <button id="exportClientBtn" class="export-btn">Экспорт в Excel</button>
                    </div>
                    <table class="client-sales-table">
                        <thead>
                            <tr>
                                <th>№</th>
                                <th>Дата</th>
                                <th>Время</th>
                                <th>Клиент</th>
                                <th>Авто</th>
                                <th>Товар</th>
                                <th>Объём</th>
                                <th>Сумма</th>
                                <th>Комментарий</th>
                            </tr>
                        </thead>
                        <tbody id="clientSalesBody"></tbody>
                        <tfoot>
                            <tr>
                                <td colspan="6" style="text-align:right;"><strong>Итого:</strong></td>
                                <td id="clientTotalVolume">0</td>
                                <td id="clientTotalAmount">0</td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        `,
        expenses: `
            <div class="container">
                <div class="block form-block">
                    <h2>Расходы</h2>
                    <form id="expenseForm">
                        <label>Дата:</label>
                        <input type="date" id="expenseDate" required>
                        <label>Время:</label>
                        <input type="time" id="expenseTime" required>
                        <label>Сумма:</label>
                        <input type="number" id="expenseAmount" step="0.01" min="0" required>
                        <label>Категория:</label>
                        <select id="expenseCategory" required>
                            <option value="">Выберите категорию</option>
                            <option>Солярка</option>
                            <option>849</option>
                            <option>Ойлик пули</option>
                            <option>Темур</option>
                            <option>Фазлиддин</option>
                        </select>
                        <label>Комментарий:</label>
                        <textarea id="expenseComment" rows="3"></textarea>
                        <button type="submit">Сохранить</button>
                    </form>
                </div>
                <div class="block history-block">
                    <div class="history-header">
                        <h2>История расходов</h2>
                        <input type="date" id="expenseDateFilter">
                        <button id="exportExpenseBtn" class="export-btn">Экспорт в Excel</button>
                    </div>
                    <table class="expenses-table">
                        <thead>
                            <tr>
                                <th>№</th>
                                <th>Дата</th>
                                <th>Время</th>
                                <th>Категория</th>
                                <th>Сумма</th>
                                <th>Комментарий</th>
                            </tr>
                        </thead>
                        <tbody id="expensesBody"></tbody>
                        <tfoot>
                            <tr>
                                <td colspan="4" style="text-align:right;"><strong>Итого:</strong></td>
                                <td id="expensesTotalAmount">0</td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        `
    };

    // ======================= ОБЩИЕ ФУНКЦИИ =======================
    function showError(message) {
        const errorDiv = document.getElementById('error-message') || createErrorDiv();
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        setTimeout(() => errorDiv.style.display = 'none', 5000);
    }

    function createErrorDiv() {
        const div = document.createElement('div');
        div.id = 'error-message';
        div.style.display = 'none';
        div.style.position = 'fixed';
        div.style.top = '20px';
        div.style.right = '20px';
        div.style.padding = '15px';
        div.style.backgroundColor = '#ff4444';
        div.style.color = 'white';
        div.style.borderRadius = '5px';
        div.style.zIndex = '1000';
        document.body.appendChild(div);
        return div;
    }

    function setCurrentDateTime(dateId, timeId) {
        const now = new Date();
        if (dateId) {
            const dateInput = document.getElementById(dateId);
            if (dateInput) dateInput.value = now.toISOString().split('T')[0];
        }
        if (timeId) {
            const timeInput = document.getElementById(timeId);
            if (timeInput) timeInput.value = now.toTimeString().slice(0, 5);
        }
    }

    function validateForm(formId) {
        const form = document.getElementById(formId);
        if (!form) return false;

        let isValid = true;
        const requiredInputs = form.querySelectorAll('[required]');

        requiredInputs.forEach(input => {
            if (!input.value.trim()) {
                input.style.borderColor = 'red';
                isValid = false;
            } else {
                input.style.borderColor = '';
            }
        });

        const numberInputs = form.querySelectorAll('input[type="number"]');
        numberInputs.forEach(input => {
            if (isNaN(parseFloat(input.value))) {
                input.style.borderColor = 'red';
                isValid = false;
            }
        });

        return isValid;
    }

    // ======================= УПРАВЛЕНИЕ ВКЛАДКАМИ =======================
    function loadTab(tabName) {
        if (!['cash', 'clients', 'expenses'].includes(tabName)) {
            console.error(`Неизвестная вкладка: ${tabName}`);
            return;
        }

        activeTab = tabName;
        document.getElementById('content').innerHTML = tabsContent[tabName];
        
        // Обновление активной кнопки
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        // Инициализация вкладки
        switch(tabName) {
            case 'cash':
                initCashTab();
                break;
            case 'clients':
                initClientsTab();
                break;
            case 'expenses':
                initExpensesTab();
                break;
        }
    }

    // ======================= НАЛИЧНЫЕ ПРОДАЖИ =======================
    function initCashTab() {
        fetchCarBrands();
        fetchCarNumbers();
        
        const form = document.getElementById('cashForm');
        if (form) {
            form.addEventListener('submit', handleCashSubmit);
        }
        
        const dateFilter = document.getElementById('cashDateFilter');
        if (dateFilter) {
            dateFilter.value = currentDate;
            dateFilter.addEventListener('change', () => loadCashSales());
        }
        
        const exportBtn = document.getElementById('exportCashBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', exportCashSalesToExcel);
        }
        
        loadCashSales();
        setCurrentDateTime('cashDate', 'cashTime');
    }

    async function handleCashSubmit(e) {
        e.preventDefault();
        const form = e.target;
        
        if (!validateForm('cashForm')) {
            showError('Заполните все обязательные поля корректно!');
            return;
        }

        try {
            const sale = {
                date: form.cashDate.value,
                time: form.cashTime.value,
                car_brand: form.cashCarBrand.value,
                car_number: form.cashCarNumber.value,
                product: form.cashProduct.value,
                volume: parseFloat(form.cashVolume.value),
                amount: parseFloat(form.cashAmount.value),
                comment: form.cashComment.value
            };

            const response = await fetch('/api/cash-sales', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sale)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Ошибка сервера');
            }

            form.reset();
            setCurrentDateTime('cashDate', 'cashTime');
            loadCashSales();
            showError('Продажа успешно сохранена');
        } catch (error) {
            console.error('Ошибка:', error);
            showError('Не удалось сохранить продажу: ' + error.message);
        }
    }

    async function loadCashSales() {
        const dateFilter = document.getElementById('cashDateFilter');
        const date = dateFilter ? dateFilter.value : currentDate;
        
        try {
            const response = await fetch(`/api/cash-sales?date=${date}`);
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Ошибка загрузки данных');
            }

            const data = await response.json();
            const tbody = document.getElementById('cashSalesBody');
            if (!tbody) return;

            tbody.innerHTML = '';
            let totalVolume = 0;
            let totalAmount = 0;

            data.forEach((sale, index) => {
                totalVolume += sale.volume || 0;
                totalAmount += sale.amount || 0;

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${sale.date}</td>
                    <td>${sale.time}</td>
                    <td>${sale.car_brand}</td>
                    <td>${sale.car_number}</td>
                    <td>${sale.product}</td>
                    <td>${(sale.volume || 0).toFixed(2)}</td>
                    <td>${(sale.amount || 0).toFixed(2)}</td>
                    <td>${sale.comment || ''}</td>
                `;
                tbody.appendChild(row);
            });

            const totalVolumeEl = document.getElementById('cashTotalVolume');
            const totalAmountEl = document.getElementById('cashTotalAmount');
            if (totalVolumeEl) totalVolumeEl.textContent = totalVolume.toFixed(2);
            if (totalAmountEl) totalAmountEl.textContent = totalAmount.toFixed(2);
        } catch (error) {
            console.error('Ошибка загрузки продаж:', error);
            showError('Не удалось загрузить продажи: ' + error.message);
        }
    }

    function exportCashSalesToExcel() {
        const dateFilter = document.getElementById('cashDateFilter');
        const date = dateFilter ? dateFilter.value : currentDate;
        window.location.href = `/export_cash_sales_excel?date=${date}`;
    }

    // ======================= КЛИЕНТСКИЕ ПРОДАЖИ =======================
    function initClientsTab() {
        fetchCarBrands();
        
        const form = document.getElementById('clientForm');
        if (form) {
            form.addEventListener('submit', handleClientSubmit);
        }
        
        const dateFilter = document.getElementById('clientDateFilter');
        if (dateFilter) {
            dateFilter.value = currentDate;
            dateFilter.addEventListener('change', () => loadClientSales());
        }
        
        const exportBtn = document.getElementById('exportClientBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', exportClientSalesToExcel);
        }
        
        loadClientSales();
        setCurrentDateTime('clientDate', 'clientTime');
    }

    async function handleClientSubmit(e) {
        e.preventDefault();
        const form = e.target;
        
        if (!validateForm('clientForm')) {
            showError('Заполните все обязательные поля корректно!');
            return;
        }

        try {
            const sale = {
                date: form.clientDate.value,
                time: form.clientTime.value,
                counterparty: form.clientCounterparty.value,
                car_brand: form.clientCarBrand.value,
                car_number: form.clientCarNumber.value,
                product: form.clientProduct.value,
                volume: parseFloat(form.clientVolume.value),
                amount: parseFloat(form.clientAmount.value),
                comment: form.clientComment.value
            };

            const response = await fetch('/api/client-sales', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sale)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Ошибка сервера');
            }

            form.reset();
            setCurrentDateTime('clientDate', 'clientTime');
            loadClientSales();
            showError('Продажа клиенту успешно сохранена');
        } catch (error) {
            console.error('Ошибка:', error);
            showError('Не удалось сохранить продажу клиенту: ' + error.message);
        }
    }

    async function loadClientSales() {
        const dateFilter = document.getElementById('clientDateFilter');
        const date = dateFilter ? dateFilter.value : currentDate;
        
        try {
            const response = await fetch(`/api/client-sales?date=${date}`);
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Ошибка загрузки данных');
            }

            const data = await response.json();
            const tbody = document.getElementById('clientSalesBody');
            if (!tbody) return;

            tbody.innerHTML = '';
            let totalVolume = 0;
            let totalAmount = 0;

            data.forEach((sale, index) => {
                totalVolume += sale.volume || 0;
                totalAmount += sale.amount || 0;

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${sale.date}</td>
                    <td>${sale.time}</td>
                    <td>${sale.counterparty}</td>
                    <td>${sale.car_brand} ${sale.car_number}</td>
                    <td>${sale.product}</td>
                    <td>${(sale.volume || 0).toFixed(2)}</td>
                    <td>${(sale.amount || 0).toFixed(2)}</td>
                    <td>${sale.comment || ''}</td>
                `;
                tbody.appendChild(row);
            });

            const totalVolumeEl = document.getElementById('clientTotalVolume');
            const totalAmountEl = document.getElementById('clientTotalAmount');
            if (totalVolumeEl) totalVolumeEl.textContent = totalVolume.toFixed(2);
            if (totalAmountEl) totalAmountEl.textContent = totalAmount.toFixed(2);
        } catch (error) {
            console.error('Ошибка загрузки продаж:', error);
            showError('Не удалось загрузить продажи клиентам: ' + error.message);
        }
    }

    function exportClientSalesToExcel() {
        const dateFilter = document.getElementById('clientDateFilter');
        const date = dateFilter ? dateFilter.value : currentDate;
        window.location.href = `/export_client_sales_excel?date=${date}`;
    }

    // ======================= РАСХОДЫ =======================
    function initExpensesTab() {
        const form = document.getElementById('expenseForm');
        if (form) {
            form.addEventListener('submit', handleExpenseSubmit);
        }
        
        const dateFilter = document.getElementById('expenseDateFilter');
        if (dateFilter) {
            dateFilter.value = currentDate;
            dateFilter.addEventListener('change', () => loadExpenses());
        }
        
        const exportBtn = document.getElementById('exportExpenseBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', exportExpensesToExcel);
        }
        
        loadExpenses();
        setCurrentDateTime('expenseDate', 'expenseTime');
    }

    async function handleExpenseSubmit(e) {
        e.preventDefault();
        const form = e.target;
        
        if (!validateForm('expenseForm')) {
            showError('Заполните все обязательные поля корректно!');
            return;
        }

        try {
            const expense = {
                date: form.expenseDate.value,
                time: form.expenseTime.value,
                amount: parseFloat(form.expenseAmount.value),
                category: form.expenseCategory.value,
                comment: form.expenseComment.value
            };

            const response = await fetch('/api/expenses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(expense)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Ошибка сервера');
            }

            form.reset();
            setCurrentDateTime('expenseDate', 'expenseTime');
            loadExpenses();
            showError('Расход успешно сохранён');
        } catch (error) {
            console.error('Ошибка:', error);
            showError('Не удалось сохранить расход: ' + error.message);
        }
    }

    async function loadExpenses() {
        const dateFilter = document.getElementById('expenseDateFilter');
        const date = dateFilter ? dateFilter.value : currentDate;
        
        try {
            const response = await fetch(`/api/expenses?date=${date}`);
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Ошибка загрузки данных');
            }

            const data = await response.json();
            const tbody = document.getElementById('expensesBody');
            if (!tbody) return;

            tbody.innerHTML = '';
            let totalAmount = 0;

            data.forEach((expense, index) => {
                totalAmount += expense.amount || 0;

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${expense.date}</td>
                    <td>${expense.time}</td>
                    <td>${expense.category}</td>
                    <td>${(expense.amount || 0).toFixed(2)}</td>
                    <td>${expense.comment || ''}</td>
                `;
                tbody.appendChild(row);
            });

            const totalAmountEl = document.getElementById('expensesTotalAmount');
            if (totalAmountEl) totalAmountEl.textContent = totalAmount.toFixed(2);
        } catch (error) {
            console.error('Ошибка загрузки расходов:', error);
            showError('Не удалось загрузить расходы: ' + error.message);
        }
    }

    function exportExpensesToExcel() {
        const dateFilter = document.getElementById('expenseDateFilter');
        const date = dateFilter ? dateFilter.value : currentDate;
        window.location.href = `/export_expenses_excel?date=${date}`;
    }

    // ======================= СПРАВОЧНИКИ =======================
    async function fetchCarBrands() {
        try {
            const response = await fetch('/api/car-brands');
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Ошибка загрузки марок');
            }

            const brands = await response.json();
            const datalists = document.querySelectorAll('#car-brands, #clientCarBrandList');
            
            datalists.forEach(datalist => {
                if (datalist) {
                    datalist.innerHTML = brands.map(brand => 
                        `<option value="${brand}">${brand}</option>`
                    ).join('');
                }
            });
        } catch (error) {
            console.error('Ошибка загрузки марок:', error);
            showError('Не удалось загрузить марки автомобилей');
        }
    }

    async function fetchCarNumbers() {
        try {
            const response = await fetch('/api/car-numbers');
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Ошибка загрузки номеров');
            }

            const numbers = await response.json();
            const datalist = document.getElementById('car-numbers');
            if (datalist) {
                datalist.innerHTML = numbers.map(number => 
                    `<option value="${number}">${number}</option>`
                ).join('');
            }
        } catch (error) {
            console.error('Ошибка загрузки номеров:', error);
            showError('Не удалось загрузить номера автомобилей');
        }
    }

    // ======================= ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ =======================
    function initApp() {
        // Настройка навигации
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tabName = btn.dataset.tab;
                if (tabName) loadTab(tabName);
            });
        });

        // Загрузка начальных данных
        fetchCarBrands();
        fetchCarNumbers();

        // Загрузка вкладки по умолчанию
        loadTab('cash');
    }

    // Запуск приложения
    initApp();
});
