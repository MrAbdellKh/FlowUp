document.addEventListener('DOMContentLoaded', () => {
    const addSaleButton = document.getElementById('add-sale');
    const addRentalButton = document.getElementById('add-rental');
    const addExpenseButton = document.getElementById('add-expense');
    const calculateButton = document.getElementById('calculate');
    const resultElement = document.getElementById('result');

    // Add another sale input
    addSaleButton.addEventListener('click', () => {
        const salesContainer = document.getElementById('sales-container');
        salesContainer.insertAdjacentHTML('beforeend', `
            <div class="form-group">
                <label for="sale-name">Item Name:</label>
                <input type="text" class="form-control sale-name" placeholder="Item name">
            </div>
            <div class="form-group">
                <label for="purchase-price">Purchase Price:</label>
                <input type="number" class="form-control purchase-price" placeholder="Purchase price">
            </div>
            <div class="form-group">
                <label for="sale-price">Sale Price:</label>
                <input type="number" class="form-control sale-price" placeholder="Sale price">
            </div>
        `);
    });

    // Add another rental input
    addRentalButton.addEventListener('click', () => {
        const rentalsContainer = document.getElementById('rentals-container');
        rentalsContainer.insertAdjacentHTML('beforeend', `
            <div class="form-group">
                <label for="rental-name">Toy Name:</label>
                <input type="text" class="form-control rental-name" placeholder="Toy name">
            </div>
            <div class="form-group">
                <label for="rental-price">Rental Price:</label>
                <input type="number" class="form-control rental-price" placeholder="Rental price">
            </div>
            <div class="form-group">
                <label for="rental-count">Number of Rentals:</label>
                <input type="number" class="form-control rental-count" placeholder="Number of rentals">
            </div>
        `);
    });

    // Add another expense input
    addExpenseButton.addEventListener('click', () => {
        const expensesContainer = document.getElementById('expenses-container');
        expensesContainer.insertAdjacentHTML('beforeend', `
            <div class="form-group">
                <label for="expense-name">Expense Name:</label>
                <input type="text" class="form-control expense-name" placeholder="Expense name">
            </div>
            <div class="form-group">
                <label for="expense-amount">Expense Amount:</label>
                <input type="number" class="form-control expense-amount" placeholder="Expense amount">
            </div>
        `);
    });

    // Calculate profit or loss
    calculateButton.addEventListener('click', () => {
        const investment = parseFloat(document.getElementById('investment').value) || 0;

        // Calculate sales profit
        const salePrices = Array.from(document.querySelectorAll('.sale-price')).map(input => parseFloat(input.value) || 0);
        const purchasePrices = Array.from(document.querySelectorAll('.purchase-price')).map(input => parseFloat(input.value) || 0);
        const salesProfit = salePrices.reduce((acc, salePrice, index) => acc + (salePrice - purchasePrices[index]), 0);

        // Calculate rental income
        const rentalPrices = Array.from(document.querySelectorAll('.rental-price')).map(input => parseFloat(input.value) || 0);
        const rentalCounts = Array.from(document.querySelectorAll('.rental-count')).map(input => parseFloat(input.value) || 0);
        const rentalIncome = rentalPrices.reduce((acc, rentalPrice, index) => acc + (rentalPrice * rentalCounts[index]), 0);

        // Calculate expenses
        const expenses = Array.from(document.querySelectorAll('.expense-amount')).map(input => parseFloat(input.value) || 0);
        const totalExpenses = expenses.reduce((acc, expense) => acc + expense, 0);

        // Calculate total profit or loss
        const totalProfit = salesProfit + rentalIncome - investment - totalExpenses;

        // Display result
        resultElement.textContent = totalProfit >= 0
            ? `You made a profit of $${totalProfit.toFixed(2)}`
            : `You incurred a loss of $${Math.abs(totalProfit).toFixed(2)}`;
    });
});