import Head from "next/head";
import Layout, { siteTitle } from "../components/layout";
import utilStyles from "../styles/utils.module.css";
import { useState } from "react";
import {
  Button,
  Chip,
  FormControl,
  Grid,
  Input,
  Item,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";

export default function Home() {
  const [searchURL, setSearchURL] = useState([]);
  const [currValue, setCurrValue] = useState("");
  const [searchText, setSearchText] = useState("");
  const [orderItem, setOrderItem] = useState("asc");
  const [orderByItem, setOrderByItem] = useState("name");
  const [data, setData] = useState([]);
  const [metrics, setMetrics] = useState("average");
  const [hasMetrics, setHasMetrics] = useState(false);
  const CONDITIONAL_FILTERS = [
    "density1",
    "density2",
    "density3",
    "percentile",
  ];

  const handleMetricsChange = (event, newMetrics) => {
    setMetrics(newMetrics);
  };

  const formatKey = (key) => {
    let i,
      frags = key.split("_");
    for (i = 0; i < frags.length; i++) {
      frags[i] = frags[i].charAt(0).toUpperCase() + frags[i].slice(1);
    }
    return frags.join(" ");
  };

  const compute = (arr) => {
    let sum = arr.reduce((a, b) => parseFloat(a) + parseFloat(b), 0);
    return {
      sum,
      average: sum / arr.length,
    };
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
      const data = {
        search: searchURL.join(","),
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
          density1: compute(formattedData[key].density1),
          density2: compute(formattedData[key].density2),
          density3: compute(formattedData[key].density3),
          percentile: compute(formattedData[key].percentile),
        };
        new_data.push(obj);
      });
      setData(new_data);
    });
  }

  const changeOrder = (name, metrics) => {
    setHasMetrics(!!metrics);
    if (orderByItem === name) {
      setOrderItem((prev) => {
        return prev === "asc" ? "desc" : "asc";
      });
    } else {
      setOrderItem("asc");
    }
    setOrderByItem(name);
  };

  const isValidUrl = (urlString) => {
    var urlPattern = new RegExp(
      "^(https?:\\/\\/)?" + // validate protocol
        "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // validate domain name
        "((\\d{1,3}\\.){3}\\d{1,3}))" + // validate OR ip (v4) address
        "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // validate port and path
        "(\\?[;&a-z\\d%_.~+=-]*)?" + // validate query string
        "(\\#[-a-z\\d_]*)?$",
      "i"
    ); // validate fragment locator
    return !!urlPattern.test(urlString);
  };
  const filterData = data.filter((dt) => {
    if (searchText !== "") {
      let filtered = false;
      let filterKey = null;
      let filterValue = null;
      if (searchText.indexOf(">") > -1) {
        filterKey = searchText
          .split(">")[0]
          .trim()
          .replace(/ /g, "")
          .toLowerCase();
        filterValue = parseFloat(searchText.split(">")[1].trim());
        filtered = true;
        if (CONDITIONAL_FILTERS.indexOf(filterKey) > -1) {
          return dt[filterKey][metrics] > filterValue;
        }
      } else if (searchText.indexOf("<") > -1) {
        filterKey = searchText
          .split("<")[0]
          .trim()
          .replace(/ /g, "")
          .toLowerCase();
        filterValue = parseFloat(searchText.split("<")[1].trim());
        filtered = true;
        if (CONDITIONAL_FILTERS.indexOf(filterKey) > -1) {
          return dt[filterKey][metrics] < filterValue;
        }
      }
      if (searchText.indexOf("=") > -1) {
        filterKey = searchText
          .split("=")[0]
          .trim()
          .replace(/ /g, "")
          .toLowerCase();
        filterValue = parseFloat(searchText.split("=")[1].trim());
        filtered = true;
        if (CONDITIONAL_FILTERS.indexOf(filterKey) > -1) {
          return dt[filterKey][metrics] === filterValue;
        }
      }
      if (!filtered) {
        return (
          JSON.stringify(dt).toLowerCase().indexOf(searchText.toLowerCase()) >
          -1
        );
      }
    } else {
      return dt;
    }
  });
  filterData.sort(getComparator(orderItem, orderByItem));

  function descendingComparator(a, b, orderBy) {
    if (hasMetrics) {
      if (b[orderBy][metrics] < a[orderBy][metrics]) {
        return -1;
      }
      if (b[orderBy][metrics] > a[orderBy][metrics]) {
        return 1;
      }
    } else {
      if (b[orderBy] < a[orderBy]) {
        return -1;
      }
      if (b[orderBy] > a[orderBy]) {
        return 1;
      }
    }
    return 0;
  }

  function getComparator(order, orderBy) {
    return order === "desc"
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  }

  const handleKeyUp = (e) => {
    if (e.target.value.trim() && (e.keyCode == 32 || e.keyCode == 13)) {
      if (isValidUrl(e.target.value.trim())) {
        setSearchURL((oldState) => [...oldState, e.target.value.trim()]);
        setCurrValue("");
      } else {
        alert("Invalid URL");
      }
    }
  };

  const handleDelete = (item, index) => {
    let arr = [...searchURL];
    arr.splice(index, 1);
    setSearchURL(arr);
  };

  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section className={utilStyles.headingMd}>
        <Grid container spacing={2}>
          <Grid item xs={2}>
            URL
          </Grid>
          <Grid item xs={8}>
            {/* <TextField
              id="outlined-basic"
              size="small"
              fullWidth
              variant="outlined"
              onChange={(e) => setSearchURL(e.target.value)}
            /> */}
            <FormControl
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                flexWrap: "wrap",
                flexDirection: "row",
                // border: "2px solid lightgray",
                padding: 4,
                borderRadius: "4px",
                "&> div.container": {
                  gap: "6px",
                  display: "flex",
                  flexDirection: "row",
                  flexWrap: "wrap",
                },
                "& > div.container > span": {
                  backgroundColor: "blue",
                  padding: "1px 3px",
                  borderRadius: "4px",
                },
              }}
            >
              <div className={"container"}>
                {searchURL.map((item, index) => (
                  <Chip
                    size="small"
                    onDelete={() => handleDelete(item, index)}
                    label={item}
                  />
                ))}
              </div>
              <Input
                value={currValue}
                onChange={(e) => {
                  setCurrValue(e.target.value);
                }}
                onKeyDown={handleKeyUp}
              />
            </FormControl>
          </Grid>
          <Grid item xs={2} alignItems="center">
            <Button variant="contained" onClick={handleSearch}>
              Search
            </Button>
          </Grid>
        </Grid>
        <Grid container style={{ background: "white" }} sx={{ p: 2 }}>
          <Grid item xs={9}>
            <ToggleButtonGroup
              size="small"
              color="primary"
              value={metrics}
              exclusive
              onChange={handleMetricsChange}
              aria-label="Type"
            >
              <ToggleButton value="average">Average</ToggleButton>
              <ToggleButton value="sum">Sum</ToggleButton>
            </ToggleButtonGroup>
          </Grid>
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
                <TableCell
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    changeOrder("name");
                  }}
                >
                  Metrics{" "}
                  {orderByItem === "name" ? (
                    orderItem === "asc" ? (
                      <ArrowUpwardRoundedIcon />
                    ) : (
                      <ArrowDownwardRoundedIcon />
                    )
                  ) : null}{" "}
                </TableCell>
                <TableCell
                  style={{ cursor: "pointer" }}
                  align="right"
                  onClick={() => {
                    changeOrder("density1", 1);
                  }}
                >
                  Density 1{" "}
                  {orderByItem === "density1" ? (
                    orderItem === "asc" ? (
                      <ArrowUpwardRoundedIcon />
                    ) : (
                      <ArrowDownwardRoundedIcon />
                    )
                  ) : null}{" "}
                </TableCell>
                <TableCell
                  style={{ cursor: "pointer" }}
                  align="right"
                  onClick={() => {
                    changeOrder("density2", 1);
                  }}
                >
                  Density 2{" "}
                  {orderByItem === "density2" ? (
                    orderItem === "asc" ? (
                      <ArrowUpwardRoundedIcon />
                    ) : (
                      <ArrowDownwardRoundedIcon />
                    )
                  ) : null}{" "}
                </TableCell>
                <TableCell
                  style={{ cursor: "pointer" }}
                  align="right"
                  onClick={() => {
                    changeOrder("density3", 1);
                  }}
                >
                  Density 3{" "}
                  {orderByItem === "density3" ? (
                    orderItem === "asc" ? (
                      <ArrowUpwardRoundedIcon />
                    ) : (
                      <ArrowDownwardRoundedIcon />
                    )
                  ) : null}{" "}
                </TableCell>
                <TableCell
                  style={{ cursor: "pointer" }}
                  align="right"
                  onClick={() => {
                    changeOrder("percentile", 1);
                  }}
                >
                  Percentile{" "}
                  {orderByItem === "percentile" ? (
                    orderItem === "asc" ? (
                      <ArrowUpwardRoundedIcon />
                    ) : (
                      <ArrowDownwardRoundedIcon />
                    )
                  ) : null}{" "}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filterData.length > 0
                ? filterData.map((dt) => (
                    <TableRow
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        {dt.name}
                      </TableCell>
                      <TableCell align="right">
                        {dt.density1[metrics]}
                      </TableCell>
                      <TableCell align="right">
                        {dt.density2[metrics]}
                      </TableCell>
                      <TableCell align="right">
                        {dt.density3[metrics]}
                      </TableCell>
                      <TableCell align="right">
                        {dt.percentile[metrics]}
                      </TableCell>
                    </TableRow>
                  ))
                : null}
            </TableBody>
          </Table>
        </TableContainer>
      </section>
    </Layout>
  );
}
