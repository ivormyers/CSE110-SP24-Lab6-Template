describe('Basic user flow for Website', () => {
    // First, visit the lab 8 website
    beforeAll(async () => {
      await page.goto('http://127.0.0.1:5500/index.html');
    });
   
   //Check that initalized home page is just one button 
    it('Initialize Home Page - Check for one button', async () => {
        console.log('Checkings for initial add note button...');
        const addNoteButton = await page.waitForSelector('button.add-note');
        expect(addNoteButton).not.toBeNull();
    });

    it('Initialize Home Page - No notes added', async () => {
        console.log('Checkings for no notes on page during initializatin...');
        const localStorageData = await page.evaluate(()=> {
            const notes = localStorage.getItem('stickynotes-notes');
            const correctNotes = null; //get item should return null as there are no elements initalized yet
            return notes==correctNotes;
        });

        expect(localStorageData).toBe(true);
    });
    
    it('Hovering over add note changes text, dehovering puts text back', async () => {
        console.log('Hovering causes the text message to change...');
        await page.waitForSelector('button.add-note');
        const noteButton = await page.$('button');
        let boolBefore = true;
        let boolPlus = true;
        let boolText = true;

        const buttonText = await page.evaluate(noteButton => {
            return document.querySelector('button').textContent;
        });
        if(buttonText !== 'Add Note'){
            boolBefore = false;
        }

        await noteButton.hover();
        const buttonText0 = await page.evaluate(noteButton => {
            return document.querySelector('button').textContent;
        });

        if(buttonText0 !== '+'){
            boolPlus = false;
        }

        await page.mouse.move(0,0);
        const buttonText1 = await page.evaluate(noteButton => {
            return document.querySelector('button').textContent;
        }); 
        
        if(buttonText1 !== 'Add Note'){
            boolText = false;
        }

        boolRet = boolPlus && boolText && boolBefore;

        expect(boolRet).toBe(true);    
        
    }, 10000);

    it('Clicking button creates a new note', async () => {
        console.log('Clicking add new note button creates a new note...');
        await page.waitForSelector('button.add-note');
        const noteButton = await page.$('button');
        await noteButton.click();

        const localStorageData = await page.evaluate(()=> {
            const notes = localStorage.getItem('stickynotes-notes');
            const notesLeng = notes.length;
            return notesLeng>0;
        });
        expect(localStorageData).toBe(true);
    });

    it('Delete note', async () => {
        console.log('Checkings that note gets deleted...');
        const noteToDel = await page.waitForSelector('textarea.note');
        await noteToDel.hover();
        await page.click('textarea.note', {clickCount: 2});
    
        const localStorageData = await page.evaluate(()=> {
            const notes = localStorage.getItem('stickynotes-notes');
            const emptyNotes = '[]';
    
            return notes == emptyNotes;
        });
    
        expect(localStorageData).toBe(true);
    });


    it('Add text to a note', async () => {
        console.log('Adding text to a note...');
        await page.waitForSelector('button.add-note');
        const noteButton = await page.$('button');
        await noteButton.click();
        await page.waitForSelector('textarea.note');
        await page.type('textarea.note', 'Hello World');
        await page.keyboard.press('Tab');
        //await page.$$(".notes");
        //const noteElems = (await page.$$(".notes"));
        //const note0 = noteElems[0].getProperty(value);
        //const output = note0.jsonValue();

        

        const localStorageData = await page.evaluate(() => { 
            const data = localStorage.getItem('stickynotes-notes');
            const dataArray = JSON.parse(data);
            return dataArray.length ==1;
        });

        const localStorageData1 = await page.evaluate(() => { 
            const data = localStorage.getItem('stickynotes-notes');
            const dataArray = JSON.parse(data);
            const note0 = dataArray[0];
            const text = note0.content;
            return text == "Hello World";
        });

        const ret = localStorageData && localStorageData1;
        expect(ret).toBe(true);
    });

    it('Modify text', async () => {
        console.log('Checkings for text modification being saved...');
        await page.click('textarea.note');
        await page.keyboard.down('Shift');
        for(let i =0; i<6;i++){
            await page.keyboard.press("ArrowLeft");
        }
        await page.keyboard.up("Shift");
        await page.keyboard.press("Backspace");
        await page.keyboard.press("Tab");

        const localStorageData = await page.evaluate(() => { 
            const data = localStorage.getItem('stickynotes-notes');
            const dataArray = JSON.parse(data);
            const note0 = dataArray[0];
            const text = note0.content;
            return text == "Hello";
        });

        await page.click('textarea.note');
        await page.type('textarea.note', " I am alive");
        await page.keyboard.press("Tab");

        const localStorageData1 = await page.evaluate(() => { 
            const data = localStorage.getItem('stickynotes-notes');
            const dataArray = JSON.parse(data);
            const note0 = dataArray[0];
            const text = note0.content;
            return text == "Hello I am alive";
        });

        const ret = localStorageData && localStorageData1;

        expect(ret).toBe(true);
    });
   
    it('Multiple notes', async () => {
        console.log('Checkings for multiple notes being stored...');
        
        await page.waitForSelector('button.add-note');
        const noteButton = await page.$('button');
        await noteButton.click();
        let textareas = await page.$$('.note');

        await textareas[1].type('Ivor Land');
        await page.keyboard.press("Tab");
        await noteButton.click();
        textareas = await page.$$('.note');

        await page.waitForSelector('textarea.note');
        await textareas[2].type('RAAAAA');
        await page.keyboard.press("Tab");

        const localStorageData = await page.evaluate(() => { 
            const data = localStorage.getItem('stickynotes-notes');
            const dataArray = JSON.parse(data);
            return dataArray.length ==3;
        });

        expect(localStorageData).toBe(true);
    });

    it('Reload page and local data is the same', async () => {
        console.log('Reload page and have data be the same...');
        const preLoadData = await page.evaluate(() => { 
            const data = localStorage.getItem('stickynotes-notes');
            return data;
        });

        await page.reload();

        const postLoadData = await page.evaluate(() => { 
            const data = localStorage.getItem('stickynotes-notes');
            return data;
        });

        const ret = (preLoadData==postLoadData);
        expect(ret).toBe(true);
    });
});


