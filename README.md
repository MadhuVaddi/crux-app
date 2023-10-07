# crux-app

## Running locally in development mode
To get started, just clone the repository and run npm install:

```
git clone https://github.com/MadhuVaddi/crux-app.git
npm install
```

Note: Replace the `<YOUR_API_KEY>` with your Google API Key in `pages/api/crux.js` file

To run the application:
```
npm run dev
```

## Developer Documentation
- Open `http://localhost:3000`
- Enter the URL(s) in the search bar at the top. Example: After entring on URL press enter/space to be added to the list
- Click on Search button to see the results
- Use `Average` or `Sum` to the average and sum of densities and percentiles of provided URL(s)
- In filter field on right top of the table, you can use multiple ways to filter the data
  - Normal text: filter based on Metrics type
  - Normal number: filter based on number of densities and percentiles
  - density1 < 0.2: filter data by density1 value with less than 0.2
  - density1 > 0.2: filter data by density1 value with greater than 0.2
  - density1 = 0.2: filter data by density1 value with equal to 0.2
  - density1 <= 0.2: filter data by density1 value with less than or equal to 0.2
  - density1 >= 0.2: filter data by density1 value with greater than or equal to 0.2

## Technologies Used:
- Next.js (React.js)
- Node.js
- Material-UI
