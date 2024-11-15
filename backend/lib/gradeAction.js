// actions/GradeAction.js
import useSWR from 'swr';
import axios from 'axios';

// Fetcher function for axios
async function fetcher(url) {
  try {
    const response = await axios.get(url);
    return response.data; // Return the data from the response
  } catch (error) {
    throw new Error(`Error fetching data: ${error.message}`);
  }
}

// Fetch user data by lineUserId
export function useUserByLineUserId(lineUserId) {
  const { data, error } = useSWR(lineUserId ? `/api/user/${lineUserId}` : null, fetcher);

  return {
    data: data?.user || {}, // Default to empty user object
    isLoading: !data && !error,
    error
  };
}
