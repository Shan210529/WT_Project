const { Builder, By, Key, until } = require('selenium-webdriver');
const assert = require('assert');

describe('Interior Designer App Tests', function () {
  this.timeout(60000); // 60 seconds timeout

  let driver;
  const baseUrl = 'http://localhost:5173';
  const timestamp = Date.now();
  const testUser = {
    name: 'Selenium User',
    email: `selenium_${timestamp}@test.com`,
    password: 'password123'
  };

  const chrome = require('selenium-webdriver/chrome');

  before(async function () {
    const options = new chrome.Options();
    // options.addArguments('--headless=new'); // Commented out to show browser
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--ignore-certificate-errors');
    options.addArguments('--window-size=1920,1080');

    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();
  });

  after(async function () {
    if (driver) {
      await driver.quit();
    }
  });

  it('should navigate to register page', async function () {
    await driver.get(`${baseUrl}/login`);
    const registerLink = await driver.findElement(By.linkText('Create Account'));
    await registerLink.click();
    await driver.wait(until.urlIs(`${baseUrl}/register`), 5000);
    // Wait for the specific header to be visible
    const head = await driver.wait(until.elementLocated(By.xpath("//h2[contains(., 'Create Account')]")), 5000);
    const text = await head.getText();
    assert.strictEqual(text, 'Create Account');
  });

  it('should register a new user successfully', async function () {
    await driver.get(`${baseUrl}/register`);

    // Fill Registration Form
    await driver.findElement(By.css('input[placeholder="John Doe"]')).sendKeys(testUser.name);
    await driver.findElement(By.css('input[type="email"]')).sendKeys(testUser.email);
    await driver.findElement(By.css('input[type="password"]')).sendKeys(testUser.password);

    // Click Register Button
    const registerBtn = await driver.findElement(By.xpath("//button[contains(text(), 'Get Started')]"));
    await registerBtn.click();

    // Wait for redirection to Dashboard
    await driver.wait(until.urlIs(`${baseUrl}/`), 10000);

    // Verify Dashboard
    const welcomeMsg = await driver.wait(until.elementLocated(By.xpath(`//h1[contains(., 'Welcome, ${testUser.name}')]`)), 10000);
    assert.ok(await welcomeMsg.isDisplayed());
  });

  it('should logout successfully', async function () {
    // Click User Menu (assuming user is logged in from previous test)
    // The user menu button contains the user name
    const userMenuBtn = await driver.findElement(By.xpath(`//button[.//span[contains(., '${testUser.name}')]]`));
    await userMenuBtn.click();

    // Wait for Sign Out button and click
    const signOutBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Sign Out')]")), 5000);
    await driver.wait(until.elementIsVisible(signOutBtn), 5000);
    await signOutBtn.click();

    // Wait for redirection to Login
    await driver.wait(until.urlIs(`${baseUrl}/login`), 10000);
  });

  it('should login successfully with valid credentials', async function () {
    // Ensure we are on login page
    const currentUrl = await driver.getCurrentUrl();
    if (currentUrl !== `${baseUrl}/login`) {
      await driver.get(`${baseUrl}/login`);
    }

    // Fill Login Form
    const emailInput = await driver.wait(until.elementLocated(By.css('input[type="email"]')), 10000);
    await emailInput.sendKeys(testUser.email);
    await driver.findElement(By.css('input[type="password"]')).sendKeys(testUser.password);

    // Click Login Button
    const loginBtn = await driver.findElement(By.xpath("//button[contains(text(), 'Sign In')]"));
    await loginBtn.click();

    // Wait for redirection to Dashboard
    try {
      await driver.wait(until.urlIs(`${baseUrl}/`), 10000);
      // Verify Dashboard loaded again
      const welcomeMsg = await driver.wait(until.elementLocated(By.xpath(`//h1[contains(., 'Welcome, ${testUser.name}')]`)), 10000);
      assert.ok(await welcomeMsg.isDisplayed());
    } catch (e) {
      const fs = require('fs');
      let debugInfo = `Error: ${e.message}\n`;
      try {
        const url = await driver.getCurrentUrl();
        debugInfo += `URL: ${url}\n`;
        const body = await driver.findElement(By.tagName('body')).getText();
        debugInfo += `Body: ${body}\n`;
      } catch (inner) {
        debugInfo += `Could not get page info: ${inner.message}\n`;
      }

      fs.writeFileSync('d:\\interior-designer-main\\selenium-tests\\failure_log.txt', debugInfo);
      throw e;
    }
  });

  it('should create a new design, save it, and then delete it', async function () {
    // 1. Ensure we are on Dashboard (Login if needed, though previous test should leave us logged in)
    const currentUrl = await driver.getCurrentUrl();
    if (currentUrl !== `${baseUrl}/`) {
      // If not on dashboard, try to login or navigate
      await driver.get(`${baseUrl}/`);
    }

    // 2. Click "Start New Project"
    const startBtn = await driver.wait(until.elementLocated(By.xpath("//a[contains(., 'Start New Project')]")), 5000);
    await startBtn.click();

    // 3. Fill Project Setup Form
    // Wait for "Project Name" input
    const nameInput = await driver.wait(until.elementLocated(By.xpath("//input[@placeholder='e.g. Dream Living Room']")), 5000);
    const designName = `Selenium Room ${Date.now()}`;
    await nameInput.sendKeys(designName);

    // Click "Create Workspace"
    const createBtn = await driver.findElement(By.xpath("//button[contains(., 'Create Workspace')]"));
    await createBtn.click();

    // 4. Wait for Editor to load (Save button visible)
    const saveBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Save Design')]")), 10000);

    // 5. Save the design (Empty)
    await saveBtn.click();

    // 6. Wait for redirect back to Dashboard
    await driver.wait(until.urlIs(`${baseUrl}/`), 10000);

    // 7. Verify the new design is listed
    // We look for the design name in the dashboard list
    // The design card has an H3 with the name
    const designCardTitle = await driver.wait(until.elementLocated(By.xpath(`//h3[contains(., '${designName}')]`)), 10000);
    assert.ok(await designCardTitle.isDisplayed(), 'Design should appear on dashboard');

    // 8. Delete the design
    // We need to find the delete button SPECIFIC to this design card.
    // We can use XPath axes to find the parent container or sibling button.
    // Structure in Dashboard.jsx: 
    // <div ...>
    //   <div>
    //      <h3 ...>{designName}</h3>
    //   </div>
    //   <div ...>
    //      <Link ...>Open Studio</Link>
    //      <button title="Delete Project" ...>...</button>
    //   </div>
    // </div>

    // XPath to find the Delete button relative to the title:
    // //h3[contains(., 'NAME')]/ancestor::div[contains(@class, 'flex-col')]//button[@title='Delete Project']
    // Note: The structure in Dashboard.jsx shows H3 is in a div, and button is in a sibling div.
    // Ancestor 'bg-white' or 'rounded-2xl' might be safer.
    // Let's try: //h3[contains(., '${designName}')]/ancestor::div[contains(@class, 'bg-white') and contains(@class, 'shadow-sm')]//button[@title='Delete Project']

    const deleteBtn = await driver.findElement(By.xpath(`//h3[contains(., '${designName}')]/ancestor::div[contains(@class, 'bg-white')][1]//button[@title='Delete Project']`));
    await deleteBtn.click();

    // 9. Handle Alert
    await driver.wait(until.alertIsPresent(), 5000);
    const alert = await driver.switchTo().alert();
    await alert.accept();

    // 10. Verify design is gone
    // Check repeatedly until the element is gone or timeout matches
    await driver.wait(async () => {
      const elements = await driver.findElements(By.xpath(`//h3[contains(., '${designName}')]`));
      return elements.length === 0;
    }, 10000, `Design '${designName}' was not removed from dashboard`);
  });

  it('should show empty state when no designs exist', async function () {
    // We just deleted the design in the previous test, so it might be empty if it was the only one.
    // However, other tests might have run. 
    // This test is conditional: checking if the "No designs" element is visible OR the list is present.
    // We will force a check for the "No designs created yet" text IF the list is empty.

    await driver.get(`${baseUrl}/`);

    // Wait for Dashboard to finish loading (wait for Navbar or specific element that confirms load)
    // We can wait until "Loading your studio..." is STALE (gone).
    // Or wait for "RoomCraft" logic.
    await driver.wait(until.elementLocated(By.xpath("//span[contains(., 'RoomCraft')]")), 10000);

    // Give a small pause for React effect
    await driver.sleep(1000);

    // Check how many projects.
    const projects = await driver.findElements(By.xpath("//h3[contains(@class, 'font-bold')]"));

    if (projects.length === 0) {
      const emptyState = await driver.wait(until.elementLocated(By.xpath("//h3[contains(., 'No designs created yet')]")), 5000);
      assert.ok(await emptyState.isDisplayed(), 'Empty state should be displayed when no projects');
    } else {
      // If projects exist, we can't test empty state easily without deleting all.
      // So we will just assert that the list container exists
      const listContainer = await driver.findElement(By.xpath("//h2[contains(., 'Your Recent Projects')]"));
      assert.ok(await listContainer.isDisplayed());
    }
  });

  it('should add furniture to the design', async function () {
    // 1. Create a new design to test furniture addition
    const currentUrl = await driver.getCurrentUrl();
    if (currentUrl !== `${baseUrl}/`) {
      await driver.get(`${baseUrl}/`);
    }

    const startBtn = await driver.wait(until.elementLocated(By.xpath("//a[contains(., 'Start New Project')]")), 5000);
    await startBtn.click();

    const nameInput = await driver.wait(until.elementLocated(By.xpath("//input[@placeholder='e.g. Dream Living Room']")), 5000);
    const designName = `Furniture Test ${Date.now()}`;
    await nameInput.sendKeys(designName);

    const createBtn = await driver.findElement(By.xpath("//button[contains(., 'Create Workspace')]"));
    await createBtn.click();

    // 2. Wait for Editor to load
    await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Save Design')]")), 10000);

    // 3. Find a furniture item in the library (e.g., "Lounge Sofa")
    // The library items are draggable = true
    const sofaItem = await driver.findElement(By.xpath("//p[contains(text(), 'Lounge Sofa')]/ancestor::div[@draggable='true']"));
    const canvas = await driver.findElement(By.css('canvas')); // Konva stage is a canvas

    // 4. Perform Drag and Drop
    // Selenium's dragAndDrop might not work perfectly with HTML5 drag and drop on all drivers.
    // We will use actions API.
    const actions = driver.actions({ bridge: true });

    // Simulate Drag and Drop manually if simple dragAndDrop fails for HTML5 DnD (which is complex in Selenium)
    // However, let's try standard actions first.
    // Note: HTML5 dnd often requires specific JS simulation.
    // Let's try to 'save' functionality as a proxy for 'item added'? No, user explicitly asked for furniture addition check.

    // Standard DnD in Selenium checks:
    await actions.dragAndDrop(sofaItem, canvas).perform();

    // 5. Verify item is added to canvas
    // Since it's a canvas, we can't inspect the DOM for the image inside the canvas easily.
    // BUT, the React state 'items' changes. 
    // We can check if the "Delete Item" button appears when we click the canvas area where we dropped it.
    // OR, we can just save and check if the saved design has items > 0 via API?
    // Let's try to see if "Delete Item" button appears if we select it. 
    // Wait... Dragging might not auto-select. 

    // Alternative: We can modify the App to expose test hooks, but we can't do that easily now.
    // Let's check if we can verify the 'items' count by saving.

    // Let's TRY to save immediately after drop.
    const saveBtn = await driver.findElement(By.xpath("//button[contains(., 'Save Design')]"));
    await saveBtn.click();

    // Wait for "Saved!"
    await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Saved!')]")), 5000);

    // Now go to dashboard
    await driver.get(`${baseUrl}/`);

    // Find the card and check "1 Items" text
    // Dashboard shows: <span ...>{design.items.length} Items</span>
    await driver.wait(until.elementLocated(By.xpath(`//h3[contains(., '${designName}')]`)), 10000);

    // Find the item count badge in the same card
    const itemCountSpan = await driver.findElement(By.xpath(`//h3[contains(., '${designName}')]/ancestor::div[contains(@class, 'flex-col')]//span[contains(., 'Items')]`));
    const itemCountText = await itemCountSpan.getText();

    // If DnD worked, it should say "1 Items". If not, "0 Items".
    // Known Issue: HTML5 DragAndDrop in Selenium Chrome is notoriously flaky without a JS helper.
    // If this assertion fails, we know we need the JS helper.
    // Let's try assertion.
    // If it is 0 items, we might need to inject a script to simulate drop.

    // If 0 items, we will assume DnD failed silently (common in Selenium+HTML5).
    // Let's try to simulate the DnD with JS if standard fails?
    // Actually, let's just assert on the text and see.
    assert.strictEqual(itemCountText, '1 Items', "Furniture item was not added (Drag and Drop failed)");

  });


});
