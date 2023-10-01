import Head from "next/head";
import Layout, { siteTitle } from "../components/layout";
import utilStyles from "../styles/utils.module.css";
import Link from "next/link";
import Date from "../components/date";
import { useState } from "react";
import {
  Button,
  Grid,
  Item,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';

export default function Home() {
  const [searchURL, setSearchURL] = useState("");
  const [searchText, setSearchText] = useState("");
  const [orderItem, setOrderItem] = useState("asc");
  const [orderByItem, setOrderByItem] = useState("name");
  const [data, setData] = useState([]);

  const formatKey = (key) => {
    let i,
      frags = key.split("_");
    for (i = 0; i < frags.length; i++) {
      frags[i] = frags[i].charAt(0).toUpperCase() + frags[i].slice(1);
    }
    return frags.join(" ");
  };

  const average = (arr) => {
    return arr.reduce((a, b) => parseFloat(a) + parseFloat(b), 0) / arr.length;
  };

  const formatData = (data) => {
    let fData = {};
    data.forEach((dt) => {
      Object.keys(dt.record.metrics).forEach((key) => {
        if (!fData[key]) {
          fData[key] = {
            density1: [],
            density2: [],
            density3: [],
            percentile: [],
          };
        }
        fData[key].density1.push(dt.record.metrics[key].histogram[0].density);
        fData[key].density2.push(dt.record.metrics[key].histogram[1].density);
        fData[key].density3.push(dt.record.metrics[key].histogram[2].density);
        fData[key].percentile.push(dt.record.metrics[key].percentiles.p75);
      });
    });
    return fData;
  };

  function handleSearch(e) {
    e.preventDefault();
    const postData = async () => {
      console.log(searchURL);
      const data = {
        search: searchURL,
      };

      const response = await fetch("/api/crux", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response.json();
    };
    postData().then((data) => {
      let formattedData = formatData(data);
      let new_data = [];
      Object.keys(formattedData).forEach((key) => {
        let obj = {
          name: formatKey(key),
          density1: average(formattedData[key].density1),
          density2: average(formattedData[key].density2),
          density3: average(formattedData[key].density3),
          percentile: average(formattedData[key].percentile),
        };
        new_data.push(obj);
      });
      setData(new_data);
    });
  }

  const changeOrder = (name) => {
    if(orderByItem === name) {
      setOrderItem(prev => {
        console.log(prev)
        return prev === 'asc' ? 'desc' : 'asc'
      })
    } else {
      setOrderItem('asc')
    }
    setOrderByItem(name)
  }

  const filterData = data.filter(dt => {
    if(searchText !== "") {
      return JSON.stringify(dt).toLowerCase().indexOf(searchText.toLowerCase()) > -1
    } else {
      return dt
    }
  })
  filterData.sort(getComparator(orderItem, orderByItem))

  function descendingComparator(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) {
      return -1
    }
    if (b[orderBy] > a[orderBy]) {
      return 1
    }
    return 0
  }
    
  function getComparator(order, orderBy) {
    return order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy)
  }

  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section className={utilStyles.headingMd}>
        <Grid container spacing={2}>
          <Grid item xs={3}>
            URL
          </Grid>
          <Grid item xs={6}>
            <TextField
              id="outlined-basic"
              size="small"
              fullWidth
              variant="outlined"
              onChange={(e) => setSearchURL(e.target.value)}
            />
          </Grid>
          <Grid item xs={3} alignItems="center">
            <Button variant="contained" onClick={handleSearch}>
              Search
            </Button>
          </Grid>
        </Grid>
        <Grid container style={{background:"white"}}>
          <Grid item xs={9}></Grid>
          <Grid item xs={3}>
            <TextField
              id="outlined-basic"
              size="small"
              fullWidth
              variant="outlined"
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Grid>
        </Grid>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell style={{cursor: "pointer"}} onClick={() => {
                  changeOrder('name')
                }}>Metrics {orderByItem === 'name' ? (orderItem === 'asc' ? <ArrowUpwardRoundedIcon/>: <ArrowDownwardRoundedIcon/>):null} </TableCell>
                <TableCell style={{cursor: "pointer"}} align="right"onClick={() => {
                  changeOrder('density1')
                }}>Density 1 {orderByItem === 'density1' ? (orderItem === 'asc' ? <ArrowUpwardRoundedIcon/>: <ArrowDownwardRoundedIcon/>):null} </TableCell>
                <TableCell style={{cursor: "pointer"}} align="right"onClick={() => {
                  changeOrder('density2')
                }}>Density 2 {orderByItem === 'density2' ? (orderItem === 'asc' ? <ArrowUpwardRoundedIcon/>: <ArrowDownwardRoundedIcon/>):null} </TableCell>
                <TableCell style={{cursor: "pointer"}} align="right"onClick={() => {
                  changeOrder('density3')
                }}>Density 3 {orderByItem === 'density3' ? (orderItem === 'asc' ? <ArrowUpwardRoundedIcon/>: <ArrowDownwardRoundedIcon/>):null} </TableCell>
                <TableCell style={{cursor: "pointer"}} align="right"onClick={() => {
                  changeOrder('percentile')
                }}>Percentile {orderByItem === 'percentile' ? (orderItem === 'asc' ? <ArrowUpwardRoundedIcon/>: <ArrowDownwardRoundedIcon/>):null} </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filterData.length > 1
                ? filterData.map((dt) => (
                    <TableRow
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        {dt.name}
                      </TableCell>
                      <TableCell align="right">{dt.density1}</TableCell>
                      <TableCell align="right">{dt.density2}</TableCell>
                      <TableCell align="right">{dt.density3}</TableCell>
                      <TableCell align="right">{dt.percentile}</TableCell>
                    </TableRow>
                  ))
                : null}
              {/* {data && Object.keys(data.record.metrics).map((key) => (
                <TableRow
                  key={key}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell component="th" scope="row">{formatKey(key)}</TableCell>
                  <TableCell align="right">{data.record.metrics[key].histogram[0].density}</TableCell>
                  <TableCell align="right">{data.record.metrics[key].histogram[1].density}</TableCell>
                  <TableCell align="right">{data.record.metrics[key].histogram[2].density}</TableCell>
                  <TableCell align="right">{data.record.metrics[key].percentiles.p75}</TableCell>
                </TableRow>
              ))} */}
            </TableBody>
          </Table>
        </TableContainer>
      </section>
    </Layout>
  );
}