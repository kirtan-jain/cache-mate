import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "../styles/Index.module.css";

const IndexPage = () => {
  const [restData, setRestData] = useState([]);
  const [graphqlData, setGraphqlData] = useState(null);
  const [cacheState, setCacheState] = useState({
    cacheEnabled: true,
    cacheAlways: false,
    loadCache: false,
  });
  const [errorSimulation, setErrorSimulation] = useState(false);

  useEffect(() => {
    const fetchInitialCacheState = async () => {
      const response = await axios.get("/cache-state");
      setCacheState(response.data);
      localStorage.setItem("cacheState", JSON.stringify(response.data));
    };
    const savedCacheState = localStorage.getItem("cacheState");
    if (savedCacheState) {
      setCacheState(JSON.parse(savedCacheState));
    } else {
      fetchInitialCacheState();
    }
  }, []);

  useEffect(() => {
    // const abortController = new AbortController();
    const fetchRestData = async () => {
      try {
        const response = await axios.get(`/api/rest`);
        setRestData(response.data);
      } catch (error) {
        console.error("rest fail", error);
      }
    };

    const fetchGraphqlData = async () => {
      try {
        const response = await axios.get(`/api/graphql`);
        console.log("index sending graphql");
        setGraphqlData(response.data.data.pokemon);
      } catch (error) {
        console.error("graphql fail", error);
      }
    };

    fetchRestData();
    fetchGraphqlData();
    // return () => abortController.abort();
  }, []);

  const toggleCache = async (type) => {
    try {
      const response = await axios.get(`/toggle-cache?type=${type}`);
      setCacheState(response.data);
      localStorage.setItem("cacheState", JSON.stringify(response.data));
    } catch (error) {
      console.error(error);
    }
  };

  const deleteCache = async () => {
    try {
      const response = await axios.get("/delete-cache");
      alert("Cache purged successfully");
    } catch (error) {
      console.error("Error deleting cache:", error);
    }
  };

  const toggleErrorSimulation = () => {
    const newval = !errorSimulation;
    localStorage.setItem("errorSimulation", newval);
    setErrorSimulation(newval);
  };

  useEffect(() => {
    const storedval = localStorage.getItem("errorSimulation");
    if (storedval) {
      setErrorSimulation(storedval === "true");
    }
  }, []);
  return (
    <div className={styles.container}>
      <div className={styles.toggles}>
        <label>
          <input
            type="checkbox"
            checked={cacheState.cacheEnabled}
            onChange={() => toggleCache("cacheEnabled")}
          />
          Enable Cache
        </label>
        <label>
          <input
            type="checkbox"
            checked={cacheState.cacheAlways}
            onChange={() => toggleCache("cacheAlways")}
          />
          Always Use Cache
        </label>
        <label>
          <input
            type="checkbox"
            checked={cacheState.loadCache}
            onChange={() => toggleCache("loadCache")}
          />
          Load from Cache if Backend Down
        </label>
      </div>
      {/* <button onClick={toggleErrorSimulation}>
        {cacheState.simulateError ? "Disable" : "Enable"} Error Simulation
      </button> */}
      <button className={styles.button} onClick={deleteCache}>
        Purge Cache
      </button>

      <div className={styles.datasection}>
        <h1>Data from GraphQL</h1>
        {graphqlData && (
          <div>
            <h2>{graphqlData.name}</h2>
            <img src={graphqlData.image} alt={graphqlData.name} />
          </div>
        )}
      </div>
      <div className={styles.datasection}>
        <h1>Data from REST</h1>
        <ul>
          {restData.map((post) => (
            <li key={post.id}>{post.title}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default IndexPage;
