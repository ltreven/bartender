const express = require('express')
const axios = require('axios')
const router = express.Router()

const constants = {
  "pt": {
    instructions: "Instruções (em inglês)",
    ingredients: "Ingredientes (em inglês)",
    noDrinks: "Não encontrei nenhum drink",
    found: "Encontrei",
    toYou: "pra você",
    willNeed: "Você vai precisar de",
    toPrepareIt: "para preparar",
    theIngredientsAre: "Os ingredientes são",
  },
  "en": {
    instructions: "Instructions",
    ingredients: "Ingredients",
    noDrinks: "No drinks were found",
    found: "I've found",
    toYou: "to you",
    willNeed: "You will need",
    toPrepareIt: "to prepare it",
    theIngredientsAre: "The ingredients are",
  },
}

const getConstant = (languageISO, constant) => {
  let lang = languageISO.substr(0,2)
  if (!constants[lang]) {
    lang = "en"
  }
  return constants[lang][constant]
}

const isReqValid = (req) => {
  return req.body && req.body.session && req.body.session.id 
    && req.body.handler && req.body.handler.name
    && req.body.user && req.body.user.locale
}

const getIngredientsList = (data) => {
  let ingredients = ""
  if (data.drinks && data.drinks[0]) {
    for (let i = 1; i <= 15; i++ ) {
      if (data.drinks[0]["strIngredient" + i]) {
        if (i > 1) {
          if (data.drinks[0]["strIngredient" + (i + 1)]) {
            ingredients += ", "
          } else {
            ingredients += " and "
          }
        }
        ingredients += data.drinks[0]["strIngredient" + i]
      }
    }  
  }
  return ingredients
}

const getDrinkCardContent = (data, languageISO) => {
  const ingredients = getIngredientsList(data)
  const content = {
    card: {
      title: data.drinks[0].strDrink,
      subtitle: data.drinks[0].strAlcoholic,
      text: `${getConstant(languageISO, "instructions")}: ${data.drinks[0].strInstructions} ${getConstant(languageISO, "ingredients")}: ${ingredients}`,
      image: {
        alt: data.drinks[0].strDrink,
        height: 0,
        url: data.drinks[0].strDrinkThumb,
        width: 0
      }
    }
  }
  return content
}

router.post('/', (req, res, next) => {

  if (!isReqValid(req)) {
    res.status(400).json({message:"Could not find the proper parameters"})
    return;
  }

  const languageISO = req.body.user.locale
  const response = {
    session: req.body.session,
    prompt: {
      override: false,
    },
    user: req.body.user
  }

  if (req.body.handler.name === 'searchname') {
    const drinkName = req.body.session.params.drinkname
    // search API
    axios.get(`https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${drinkName}`)
    .then(resp => {
      console.log("resp", resp.data)
      if (resp.data.drinks && resp.data.drinks.length > 0) {
        response.prompt.content = getDrinkCardContent(resp.data, languageISO)
        const ingredients = getIngredientsList(resp.data)
        response.prompt.firstSimple = {
          speech: `${getConstant(languageISO, "found")} ${resp.data.drinks[0].strDrink} ${getConstant(languageISO, "toYou")}! ${getConstant(languageISO, "willNeed")} ${ingredients} ${getConstant(languageISO, "toPrepareIt")}.`,
          text: ""
        }
        response.session.params.drinkname = resp.data.drinks[0].strDrink
        response.session.params.instructions = resp.data.drinks[0].strInstructions
        response.session.params.ingredients = ingredients
      } else {
        // could not find any drinks
        response.prompt.firstSimple = {
          speech: getConstant(languageISO, "noDrinks"),
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
    // search API
    axios.get(`https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${ingredient}`)
    .then(resp => {
      if (resp.data.drinks && resp.data.drinks.length > 0) {
        response.prompt.content = getDrinkCardContent(resp.data, languageISO)
        const ingredients = getIngredientsList(resp.data)
        response.prompt.firstSimple = {
          speech: `${getConstant(languageISO, "found")} ${resp.data.drinks[0].strDrink} ${getConstant(languageISO, "toYou")}! ${getConstant(languageISO, "willNeed")} ${ingredients} ${getConstant(languageISO, "toPrepareIt")}.`,
          text: ""
        }
        response.session.params.drinkname = resp.data.drinks[0].strDrink
        response.session.params.instructions = resp.data.drinks[0].strInstructions
        response.session.params.ingredients = ingredients
      } else {
        // could not find any drinks
        response.prompt.firstSimple = {
          speech: getConstant(languageISO, "noDrinks"),
          text: ""
        }
      }
      res.status(200).json(response)

    })
    .catch(err => {
      res.status(500).json({message:"error talking to the API"})
    })

  } else if (req.body.handler.name === 'readinstructions') {
    if (req.body.session.params.instructions) {
      response.prompt.firstSimple = {
        speech: req.body.session.params.instructions,
        text: ""
      }
      res.status(200).json(response)

    } else {
      // FETCH API
      const drinkName = req.body.session.params.drinkname
      console.log("drink name", drinkName)
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
            speech: getConstant(languageISO, "noDrinks"),
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

  } else if (req.body.handler.name === 'readingredients') {
    if (req.body.session.params.ingredients) {
      response.prompt.firstSimple = {
        speech: getConstant(languageISO, "theIngredientsAre") + ": " + req.body.session.params.ingredients + ".",
        text: ""
      }
      res.status(200).json(response)

    } else {
      const drinkName = req.body.session.params.drinkname
      console.log("drink name", drinkName)
      // search API
      axios.get(`https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${drinkName}`)
      .then(resp => {
        if (resp.data.drinks && resp.data.drinks.length > 0) {
          const ingredients = getIngredientsList(resp.data)

          response.prompt.firstSimple = {
            speech: getConstant(languageISO, "theIngredientsAre") + ": " + ingredients + ".",
            text: ""
          }

        } else {
          // could not find any drinks
          response.prompt.firstSimple = {
            speech: getConstant(languageISO, "noDrinks"),
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

  
})

module.exports = router