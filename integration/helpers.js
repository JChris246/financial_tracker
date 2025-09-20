export const addTransaction = async (page, value, assetType="cash", currency="eur", date, name="Test Transaction") => {
    const addTransactionButton = page.locator("#add-transaction-button");

    await addTransactionButton.click();
    await page.locator("#transaction-name").fill(name);
    await page.locator("#transaction-amount").fill(value);
    await page.locator("#transaction-category").selectOption({ value: "other" });
    await page.locator("#transaction-asset-type").selectOption({ value: assetType });
    await page.locator("#transaction-currency").selectOption({ value: currency });
    if (date) {
        await page.locator("#transaction-date").fill(date);
    }
    await page.locator("#submit-transaction").click();
};

const pad = (v, n = 2) => {
    v = v + ""; // convert to string
    if (v.length >= n)
        return v;
    for (let i = 0; i < n; i++) {
        v = "0" + v;
        if (v.length >= n)
            break;
    }
    return v;
};

export const formatInputDate = (d) => {
    const date = d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
    const time = pad(d.getHours()) + ":" + pad(d.getMinutes());

    return date + "T" + time; // YYYY-MM-DDThh:mm - 2022-01-07T23:43
};