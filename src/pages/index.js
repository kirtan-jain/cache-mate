import React, { useEffect, useState } from "react";
import axios from "axios";
const IndexPage = () => {
  const [restData, setRestData] = useState([]);
  const [graphqlData, setGraphqlData] = useState(null);
  const [cacheEnabled, setCacheEnabled] = useState(true);
  useEffect(() => {
    const fetchInitialCacheState = async () => {
      const response = await axios.get("/cache-state");
      setCacheEnabled(response.data.cacheEnabled);
    };

    fetchInitialCacheState();
  }, []);
  useEffect(() => {
    const fetchRestData = async () => {
      try {
        const response = await axios.get("/api/rest");
        setRestData(response.data);
      } catch (error) {
        console.error("rest fail", error);
      }
    };
    const fetchGraphqlData = async () => {
      try {
        const response = await axios.get("/api/graphql");
        setGraphqlData(response.data.data.pokemon);
      } catch (error) {
        console.error("graphql fail", error);
      }
    };
    fetchRestData();
    fetchGraphqlData();
  }, []);

  const toggleCache = async () => {
    const response = await axios.get("/toggle-cache");
    setCacheEnabled(response.data.cacheEnabled);
  };

  return (
    <div>
      <button onClick={toggleCache}>
        {cacheEnabled ? "Disable" : "Enable"} Cache
      </button>
      <h1>Data from GraphQL</h1>
      {graphqlData && (
        <div>
          <h2>{graphqlData.name}</h2>
          <img src={graphqlData.image} alt={graphqlData.name} />
        </div>
      )}
      <h1>Data from REST</h1>
      <ul>
        {restData.map((post) => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </div>
  );
};

export default IndexPage;
