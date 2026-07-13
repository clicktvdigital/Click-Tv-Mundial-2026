export default async function handler(req, res) {

  const TOKEN = process.env.FOOTBALL_DATA_TOKEN;

  if (!TOKEN) {
    return res.status(500).json({
      error: "Falta FOOTBALL_DATA_TOKEN"
    });
  }


  try {

    const response = await fetch(
      "https://api.football-data.org/v4/competitions/WC/matches",
      {
        headers:{
          "X-Auth-Token": 467c885c07fa49baa40ac78cf636f8b0
        }
      }
    );


    const data = await response.json();


    res.status(200).json(data);


  } catch(error){

    res.status(500).json({
      error:error.message
    });

  }

}
