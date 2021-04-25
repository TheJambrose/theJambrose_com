//creates API URLs from two different states and returns them in a two item array
let stateA = "";
let stateB = "";
let stateObjA = [];
let stateObjB = [];
let fullStateName = {
    'AK': 'Alaska',
    'AL': 'Alabama',
    'AR': 'Arkansas',
    'AS': 'American Samoa',
    'AZ': 'Arizona',
    'CA': 'California',
    'CO': 'Colorado',
    'CT': 'Connecticut',
    'DC': 'District of Columbia',
    'DE': 'Delaware',
    'FL': 'Florida',
    'GA': 'Georgia',
    'GU': 'Guam',
    'HI': 'Hawaii',
    'IA': 'Iowa',
    'ID': 'Idaho',
    'IL': 'Illinois',
    'IN': 'Indiana',
    'KS': 'Kansas',
    'KY': 'Kentucky',
    'LA': 'Louisiana',
    'MA': 'Massachusetts',
    'MD': 'Maryland',
    'ME': 'Maine',
    'MI': 'Michigan',
    'MN': 'Minnesota',
    'MO': 'Missouri',
    'MP': 'Northern Mariana Islands',
    'MS': 'Mississippi',
    'MT': 'Montana',
    'NA': 'National',
    'NC': 'North Carolina',
    'ND': 'North Dakota',
    'NE': 'Nebraska',
    'NH': 'New Hampshire',
    'NJ': 'New Jersey',
    'NM': 'New Mexico',
    'NV': 'Nevada',
    'NY': 'New York',
    'OH': 'Ohio',
    'OK': 'Oklahoma',
    'OR': 'Oregon',
    'PA': 'Pennsylvania',
    'PR': 'Puerto Rico',
    'RI': 'Rhode Island',
    'SC': 'South Carolina',
    'SD': 'South Dakota',
    'TN': 'Tennessee',
    'TX': 'Texas',
    'UT': 'Utah',
    'VA': 'Virginia',
    'VI': 'Virgin Islands',
    'VT': 'Vermont',
    'WA': 'Washington',
    'WI': 'Wisconsin',
    'WV': 'West Virginia',
    'WY': 'Wyoming'
}
//Because this data breaks NYC and NY state into separate 
//Data sets we have to manually combine them if NY is chosen
//These variables will get us there.

let nycStateObj = []
let nycUrl = "https://data.cdc.gov/resource/9mfq-cb36.json?$$app_token=xpHuU3JzTgbvtcsx76IxzdUkR&state=NYC"
function combineNYandNYC(NyTotals, NycTotals) {
    NyTotals.forEach(nyStateMonth => {
        NycTotals.forEach(nycMonth => {
            if (nyStateMonth.year == nycMonth.year && nyStateMonth.month == nycMonth.month) {
                nyStateMonth.monthlyTotal += nycMonth.monthlyTotal;
            }
        })
    })
};

function makeUrlsFromSelection() {
    stateA = document.getElementById("stateA").value;
    stateB = document.getElementById("stateB").value;
    //make sure the states selected are different
    if (stateA != stateB) {
        let baseURL = "https://data.cdc.gov/resource/9mfq-cb36.json"
        let myAppToken = "xpHuU3JzTgbvtcsx76IxzdUkR";
        let TokenString = "?$$app_token=" + myAppToken;
        let stateFilter = "&state="
        let filteredUrlA = baseURL + TokenString + stateFilter + stateA;
        let filteredUrlB = baseURL + TokenString + stateFilter + stateB;
        return [filteredUrlA, filteredUrlB];
    } alert("Please make sure you have selected two different states")

}
// 
async function confirmStates() {
    try {
        let [stateAUrl, stateBUrl] = makeUrlsFromSelection()
        console.log(stateAUrl, stateBUrl);
        // const response = await fetch('https://data.cdc.gov/resource/9mfq-cb36.json');
        const [responseA, responseB] = await Promise.all([
            fetch(stateAUrl),
            fetch(stateBUrl),
        ]);
        [stateObjA, stateObjB] = await Promise.all([
            responseA.json(),
            responseB.json(),
        ]);

        //NYC workaround
        if (stateA == "NY" || stateB == "NY") {
            console.log(nycUrl);
            const responseC = await fetch(nycUrl);
            nycStateObj = await responseC.json();
        }

    } catch (error) {
        console.log(error);
    }
    // create visual cue that data was successfully and
    // enable TableGen Button
    let tableGenBut = document.getElementById("tableGen");
    tableGenBut.disabled = false;
}
function makeBothTables() {
    stateADaily = dailyDeathTotal(stateObjA);
    stateBDaily = dailyDeathTotal(stateObjB);

    stateAMonthlyTotals = monthlyTotalByYear(stateADaily);
    stateBMonthlyTotals = monthlyTotalByYear(stateBDaily);

    // if either state was NY make sure we combine NY state data with NYC data.
    if (stateA == "NY") {
        let stateNycDaily = dailyDeathTotal(nycStateObj);
        let stateNycTotals = monthlyTotalByYear(stateNycDaily);
        combineNYandNYC(stateAMonthlyTotals, stateNycTotals);
    } else if (stateB == "NY") {
        let stateNycDaily = dailyDeathTotal(nycStateObj);
        let stateNycTotals = monthlyTotalByYear(stateNycDaily);
        combineNYandNYC(stateBMonthlyTotals, stateNycTotals);
    };
    //Finally the magic happens
    makeTable(stateAMonthlyTotals, stateBMonthlyTotals);
};



// take the data for a single state and return an array of objects that have Year, month, and Date of total deaths
function dailyDeathTotal(singleStateObjArray) {
    let totalDeathByDay = [];
    singleStateObjArray.forEach(subDate => {
        let dirtySubDate = subDate.submission_date;
        //get the year
        let cleanYear = dirtySubDate.substring(0, 4);
        let cleanMonth = dirtySubDate.substring(5, 7);
        let cleanDate = dirtySubDate.substring(8, 10);
        // console.log(`Current date is ${cleanDate}.`);
        totalDeathByDay.push({
            year: cleanYear,
            month: cleanMonth,
            date: cleanDate,
            "total_deaths": subDate.tot_death
        });
    });
    //sort it all by date
    totalDeathByDay.sort(function (a, b) {
        return a.date - b.date;
    });
    //sort it all by months
    totalDeathByDay.sort(function (a, b) {
        return a.month - b.month;
    });
    //sort it all by years
    totalDeathByDay.sort(function (a, b) {
        return a.year - b.year;
    });
    return totalDeathByDay;
}

//takes a single state's daily deaths totals and returns an array of obj similar to {year: '2020', month: '01', monthlyTotal: 1023}
function monthlyTotalByYear(dailyDeathTotalArrayObj) {
    let yearAndMonth = [];
    dailyDeathTotalArrayObj.forEach(yearMonthDate => {

        //create a year and month object with {year: ##,  month: ##, monthlyTotal:0 }
        if (!yearAndMonth.some(year => year.year == yearMonthDate.year)) {
            yearAndMonth.push({
                "year": yearMonthDate.year,
                "month": yearMonthDate.month,
                "monthlyTotal": 0
            });
        } else if (!yearAndMonth.some(year => year.year == yearMonthDate.year && year.month == yearMonthDate.month)) {
            yearAndMonth.push({
                "year": yearMonthDate.year,
                "month": yearMonthDate.month,
                "monthlyTotal": 0
            });
        }
    });

    //find the max value for each month by year and assign i to to monthly Total
    yearAndMonth.forEach(month => {
        let monthlyTotals = [];
        //push each total to the monthly totals Array
        dailyDeathTotalArrayObj.forEach(singleDay => {
            if (month.year == singleDay.year && month.month == singleDay.month) {
                monthlyTotals.push(singleDay.total_deaths)
            }
        });

        // find the max value since totals for each month are cumulative and return that total to the monthlyTotal property
        month.monthlyTotal = Math.max(...monthlyTotals);
    });

    return yearAndMonth;
};


function makeTable(stateAObjArray, stateBObjArray) {

    //combine the monthly totals 
    let bothStateArrys = [stateAObjArray, stateBObjArray];

    //create a table
    let newTable = document.createElement("table");
    let outputArea = document.getElementById("tableOutput");

    // create table Caption
    let caption = newTable.createCaption();
    caption.textContent = `Total COVID Deaths by Month for ${fullStateName[stateA]} and ${fullStateName[stateB]}.`;

    //create table Head
    function generateTableHead(table) {
        //headers will be identical
        let headerNames = [fullStateName[stateA], fullStateName[stateB]];
        let blankHeader = `Year-Month`;
        //create space for row Header names
        headerNames.unshift(blankHeader);
        // headerNames = headerNames.map(string => toTitleCase(string));
        let tHead = table.createTHead();
        let tHRow = tHead.insertRow();

        headerNames.forEach(element => {
            let th = document.createElement("th");
            let text = document.createTextNode(element);
            th.appendChild(text);
            tHRow.appendChild(th);
        });
    }

    // create Table Body
    function generateTableBody(table) {
        let tBody = table.createTBody();
        let combinedRows = {}
        bothStateArrys.forEach((stateArray, i) => {

            stateArray.forEach(month => {
                if (!combinedRows[month.year + "-" + month.month]) {
                    combinedRows[month.year + "-" + month.month] = [month.monthlyTotal];
                } else {
                    combinedRows[month.year + "-" + month.month].push(month.monthlyTotal);
                }
            });
        });

        //used combinedRows to fill table
        for (const month in combinedRows) {
            let tRow = tBody.insertRow();
            let th = document.createElement("th");
            let text = document.createTextNode(month);
            th.appendChild(text);
            tRow.appendChild(th);
            let stateACell = tRow.insertCell();
            let stateAText = document.createTextNode(combinedRows[month][0]);
            stateACell.append(stateAText);
            let stateBCell = tRow.insertCell();
            let stateBText = document.createTextNode(combinedRows[month][1]);
            stateBCell.append(stateBText);
        }




    }

    //add the table sections to DOM
    generateTableHead(newTable);
    generateTableBody(newTable);
    outputArea.append(newTable);
}


//because this data has NYC and NY data a SEPARATE stats for
//some stupid reason, we have to combine them
function combineNYandNYC(NyTotals, NycTotals) {
    NyTotals.forEach(nyStateMonth => {
        NycTotals.forEach(nycMonth => {
            if (nyStateMonth.year == nycMonth.year && nyStateMonth.month == nycMonth.month) {
                nyStateMonth.monthlyTotal += nycMonth.monthlyTotal;
            }
        })
    })
};

function reset() {
    let tableDispay = document.getElementById("tableOutput");
    tableDispay.innerHTML = "";
    stateA = "";
    stateB = "";
    stateObjA = [];
    stateObjB = [];
    let tableGenBut = document.getElementById("tableGen");
    tableGenBut.disabled = true;

};
