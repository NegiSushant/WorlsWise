import {
  createContext,
  useEffect,
  useContext,
  useReducer,
  useCallback,
} from "react";

const CitiesContext = createContext();

const initialState = {
  cities: [],
  isLoading: false,
  currentCity: {},
  error: "",
};

function reducer(state, action) {
  switch (action.type) {
    case "loading":
      return { ...state, isLoading: true };

    case "cities/loaded":
      return {
        ...state,
        isLoading: false,
        cities: action.payload,
      };

    case "city/loaded":
      return { ...state, isLoading: false, currentCity: action.payload };

    case "city/created":
      return {
        ...state,
        isLoading: false,
        cities: [...state.cities, action.payload],
        currentCity: action.payload,
      };

    case "city/deleted":
      return {
        ...state,
        isLoading: false,
        cities: state.cities.filter((city) => city.id !== action.payload),
        currentCity: {},
      };

    case "rejected":
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    default:
      throw new Error("Unknown action type");
  }
}

function CitiesProvider({ children }) {
  const [{ cities, isLoading, currentCity, error }, dispatch] = useReducer(
    reducer,
    initialState
  );

  // ✅ Load cities from static file
  useEffect(function () {
    async function fetchCities() {
      dispatch({ type: "loading" });

      try {
        const res = await fetch(`/cities.json`);
        const data = await res.json();
        dispatch({ type: "cities/loaded", payload: data });
      } catch {
        dispatch({
          type: "rejected",
          payload: "There was an error loading cities...",
        });
      }
    }
    fetchCities();
  }, []);

  // ✅ Get single city from loaded list (no API)
  const getCity = useCallback(
    async function getCity(id) {
      if (Number(id) === currentCity.id) return;

      dispatch({ type: "loading" });

      try {
        const city = cities.find((c) => c.id === Number(id));
        if (!city) throw new Error("City not found");
        dispatch({ type: "city/loaded", payload: city });
      } catch {
        dispatch({
          type: "rejected",
          payload: "There was an error loading the city...",
        });
      }
    },
    [currentCity.id, cities]
  );

  // ✅ Fake createCity (updates local state only)
  async function createCity(newCity) {
    dispatch({ type: "loading" });

    try {
      // In production, just update state (no API)
      dispatch({ type: "city/created", payload: newCity });
    } catch {
      dispatch({
        type: "rejected",
        payload: "There was an error creating the city...",
      });
    }
  }

  // ✅ Fake deleteCity (updates local state only)
  async function deleteCity(id) {
    dispatch({ type: "loading" });

    try {
      // In production, just update state (no API)
      dispatch({ type: "city/deleted", payload: id });
    } catch {
      dispatch({
        type: "rejected",
        payload: "There was an error deleting the city...",
      });
    }
  }

  return (
    <CitiesContext.Provider
      value={{
        cities,
        isLoading,
        currentCity,
        error,
        getCity,
        createCity,
        deleteCity,
      }}
    >
      {children}
    </CitiesContext.Provider>
  );
}

function useCities() {
  const context = useContext(CitiesContext);
  if (context === undefined)
    throw new Error("CitiesContext was used outside the CitiesProvider");
  return context;
}

export { CitiesProvider, useCities };






// import {
//   createContext,
//   useEffect,
//   useContext,
//   useReducer,
//   useCallback,
// } from "react";

// const BASE_URL = "http://localhost:9000";

// const CitiesContext = createContext();

// const initialState = {
//   cities: [],
//   isLoading: false,
//   currentCity: {},
//   error: "",
// };

// function reducer(state, action) {
//   switch (action.type) {
//     case "loading":
//       return { ...state, isLoading: true };

//     case "cities/loaded":
//       return {
//         ...state,
//         isLoading: false,
//         cities: action.payload,
//       };

//     case "city/loaded":
//       return { ...state, isLoading: false, currentCity: action.payload };

//     case "city/created":
//       return {
//         ...state,
//         isLoading: false,
//         cities: [...state.cities, action.payload],
//         currentCity: action.payload,
//       };

//     case "city/deleted":
//       return {
//         ...state,
//         isLoading: false,
//         cities: state.cities.filter((city) => city.id !== action.payload),
//         currentCity: {},
//       };

//     case "rejected":
//       return {
//         ...state,
//         isLoading: false,
//         error: action.payload,
//       };

//     default:
//       throw new Error("Unknown action type");
//   }
// }

// function CitiesProvider({ children }) {
//   const [{ cities, isLoading, currentCity, error }, dispatch] = useReducer(
//     reducer,
//     initialState
//   );

//   useEffect(function () {
//     async function fetchCities() {
//       dispatch({ type: "loading" });

//       try {
//         // const res = await fetch(`${BASE_URL}/cities`);
//         const res = await fetch(`/cities.json`);
//         const data = await res.json();
//         dispatch({ type: "cities/loaded", payload: data });
//       } catch {
//         dispatch({
//           type: "rejected",
//           payload: "There was an error loading cities...",
//         });
//       }
//     }
//     fetchCities();
//   }, []);

//   const getCity = useCallback(
//     async function getCity(id) {
//       if (Number(id) === currentCity.id) return;

//       dispatch({ type: "loading" });

//       try {
//         const res = await fetch(`${BASE_URL}/cities/${id}`);
//         const data = await res.json();
//         dispatch({ type: "city/loaded", payload: data });
//       } catch {
//         dispatch({
//           type: "rejected",
//           payload: "There was an error loading the city...",
//         });
//       }
//     },
//     [currentCity.id]
//   );

//   async function createCity(newCity) {
//     dispatch({ type: "loading" });

//     try {
//       const res = await fetch(`${BASE_URL}/cities`, {
//         method: "POST",
//         body: JSON.stringify(newCity),
//         headers: {
//           "Content-Type": "application/json",
//         },
//       });
//       const data = await res.json();

//       dispatch({ type: "city/created", payload: data });
//     } catch {
//       dispatch({
//         type: "rejected",
//         payload: "There was an error creating the city...",
//       });
//     }
//   }

//   async function deleteCity(id) {
//     dispatch({ type: "loading" });

//     try {
//       await fetch(`${BASE_URL}/cities/${id}`, {
//         method: "DELETE",
//       });

//       dispatch({ type: "city/deleted", payload: id });
//     } catch {
//       dispatch({
//         type: "rejected",
//         payload: "There was an error deleting the city...",
//       });
//     }
//   }

//   return (
//     <CitiesContext.Provider
//       value={{
//         cities,
//         isLoading,
//         currentCity,
//         error,
//         getCity,
//         createCity,
//         deleteCity,
//       }}
//     >
//       {children}
//     </CitiesContext.Provider>
//   );
// }

// function useCities() {
//   const context = useContext(CitiesContext);
//   if (context === undefined)
//     throw new Error("CitiesContext was used outside the CitiesProvider");
//   return context;
// }

// export { CitiesProvider, useCities };
