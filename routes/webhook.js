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
        response.prompt.content = {
          card: {
            title: "Margarita",
            subtitle: "Alcoholic drink",
            text: "Instructions: Rub the rim of the glass with the lime slice to make the salt stick to it. Take care to moisten only the outer rim and sprinkle the salt on it. The salt should present to the lips of the imbiber and never mix into the cocktail. Shake the other ingredients with ice, then carefully pour into the glass. Ingredients: Tequila, Triple sec and lime.",
            image: {
              alt: "margarita",
              height: 0,
              url: "https://www.thecocktaildb.com/images/media/drink/5noda61589575158.jpg",
              width: 0
            }

          },
          firstSimple: {
            speech: "I've found Margarita to you! You will need Tequila, Triple sec and lime to prepare it.",
            text: ""
          }
        }
        res.status(200).json(response)

      } else if (req.body.handler.name === 'searchingredient') {
        const ingredient = req.body.session.params.ingredient
        console.log("ingredient", ingredient)
        response.prompt.content = {
          card: {
            title: "Margarita (by ingredient)",
            subtitle: "Alcoholic drink",
            text: "Instructions: Rub the rim of the glass with the lime slice to make the salt stick to it. Take care to moisten only the outer rim and sprinkle the salt on it. The salt should present to the lips of the imbiber and never mix into the cocktail. Shake the other ingredients with ice, then carefully pour into the glass. Ingredients: Tequila, Triple sec and lime.",
            image: {
              alt: "margarita",
              height: 0,
              url: "https://www.thecocktaildb.com/images/media/drink/5noda61589575158.jpg",
              width: 0
            }

          },
          firstSimple: {
            speech: "I've found Margarita to you! You will need Tequila, Triple sec and lime to prepare it.",
            text: ""
          }
        }
        res.status(200).json(response)

      }
    }
  }
  res.status(400).json({message:"Could not find the proper parameters"})
  return;
  
})

module.exports = router