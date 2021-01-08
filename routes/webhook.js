const express = require('express')
const axios = require('axios')
const router = express.Router()

router.post('/', (req, res, next) => {
  console.log(req.body.handler)

  if (req.body.session && req.body.session.id) {
    const response = {
      session: req.body.session,
      prompt: {
        override: false,
      }
    }
    const sessionId = req.body.session.id
    if (req.body.handler && req.body.handler.name) {
      if (req.body.handler.name === 'searchname') {
        const drinkName = req.body.session.params.drinkname
        console.log("drink name", drinkName)
        // search API
        axios.get(`https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${drinkName}`)
        .then(resp => {
          if (resp.data.drinks && resp.data.drinks.length > 0) {
            let ingredients = ""
            for (let i = 1; i <= 15; i++ ) {
              if (resp.data.drinks[0]["strIngredient" + i]) {
                if (i > 1) {
                  ingredients += ", "
                }
                ingredients += resp.data.drinks[0]["strIngredient" + i]
              }
            }
            response.prompt.content = {
              card: {
                title: resp.data.drinks[0].strDrink,
                subtitle: resp.data.drinks[0].strAlcoholic,
                text: "Instructions: " + resp.data.drinks[0].strInstructions + ". Ingredients: " + ingredients,
                image: {
                  alt: resp.data.drinks[0].strDrink,
                  height: 0,
                  url: resp.data.drinks[0].strDrinkThumb,
                  width: 0
                }
              }
            }
            response.prompt.firstSimple = {
              speech: `I've found ${resp.data.drinks[0].strDrink} to you! You will need ${ingredients} to prepare it.`,
              text: ""
            }
    
          } else {
            // could not find any drinks
            response.prompt.firstSimple = {
              speech: `No drinks were found.`,
              text: ""
            }
          }
          res.status(200).json(response)

        })
        .catch(err => {
          console.error(err)
          res.status(500).json({message:"error talking to the API"})
        })

      } else if (req.body.handler.name === 'searchingredient') {
        const ingredient = req.body.session.params.ingredient
        console.log("ingredient", ingredient)
        // search API
        axios.get(`https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${ingredient}`)
        .then(resp => {
          if (resp.data.drinks && resp.data.drinks.length > 0) {
            let ingredients = ""
            for (let i = 1; i <= 15; i++ ) {
              if (resp.data.drinks[0]["strIngredient" + i]) {
                if (i > 1) {
                  ingredients += ", "
                }
                ingredients += resp.data.drinks[0]["strIngredient" + i]
              }
            }
            response.prompt.content = {
              card: {
                title: resp.data.drinks[0].strDrink,
                subtitle: resp.data.drinks[0].strAlcoholic,
                text: "Instructions: " + resp.data.drinks[0].strInstructions + ". Ingredients: " + ingredients,
                image: {
                  alt: resp.data.drinks[0].strDrink,
                  height: 0,
                  url: resp.data.drinks[0].strDrinkThumb,
                  width: 0
                }
              }
            }
            response.prompt.firstSimple = {
              speech: `I've found ${resp.data.drinks[0].strDrink} to you! You will need ${ingredients} to prepare it.`,
              text: ""
            }
    
          } else {
            // could not find any drinks
            response.prompt.firstSimple = {
              speech: `No drinks were found.`,
              text: ""
            }
          }
          res.status(200).json(response)

        })
        .catch(err => {
          res.status(500).json({message:"error talking to the API"})
        })

      } else if (req.body.handler.name === 'readinstructions') {
        const drinkName = req.body.session.params.drinkname
        console.log("drink name", drinkName)
        // search API
        axios.get(`https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${drinkName}`)
        .then(resp => {
          if (resp.data.drinks && resp.data.drinks.length > 0) {
            response.prompt.firstSimple = {
              speech: resp.data.drinks[0].strInstructions,
              text: ""
            }
    
          } else {
            // could not find any drinks
            response.prompt.firstSimple = {
              speech: `No drinks were found.`,
              text: ""
            }
          }
          res.status(200).json(response)

        })
        .catch(err => {
          console.error(err)
          res.status(500).json({message:"error talking to the API"})
        })
      } else if (req.body.handler.name === 'readingredients') {
        const drinkName = req.body.session.params.drinkname
        console.log("drink name", drinkName)
        // search API
        axios.get(`https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${drinkName}`)
        .then(resp => {
          if (resp.data.drinks && resp.data.drinks.length > 0) {
            let ingredients = ""
            for (let i = 1; i <= 15; i++ ) {
              if (resp.data.drinks[0]["strIngredient" + i]) {
                if (i > 1) {
                  ingredients += ", "
                }
                ingredients += resp.data.drinks[0]["strIngredient" + i]
              }
            }

            response.prompt.firstSimple = {
              speech: 'The ingredients are: ' + ingredients + ".",
              text: ""
            }
    
          } else {
            // could not find any drinks
            response.prompt.firstSimple = {
              speech: `No drinks were found.`,
              text: ""
            }
          }
          res.status(200).json(response)

        })
        .catch(err => {
          console.error(err)
          res.status(500).json({message:"error talking to the API"})
        })

      }
    }
  } else {
    res.status(400).json({message:"Could not find the proper parameters"})
  }
  
})

module.exports = router