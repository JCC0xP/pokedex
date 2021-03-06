import React, { Component } from 'react'
import { graphql, gql } from 'react-apollo'

import Cards from './Cards'
import Nav from '../nav/Nav'
import DropdownList from '../nav/DropdownList'
import FloatButton from '../floatActionButton/FloatButton'

import $ from 'jquery'

class CardList extends Component {
    constructor(props) {
        super(props)
        this.state = {
            options: [
                {
                    key: 'searchPokemons',
                    icon: 'search',
                    color: 'blue',
                    to: '/search'
                },
                {
                    key: 'newPokemons',
                    icon: 'publish',
                    color: 'green',
                    to: '/new'
                }
            ]
        }
    }

    componentWillMount() {
        $('body').addClass(`${this.props.typeColor || ''} lighten-4`)
    }

    componentDidMount() {
        this._subscribeToNewLinks()
    }

    _subscribeToNewLinks = () => {
        this.props.allPokemonsQuery.subscribeToMore({
            document: gql`
                subscription {
                    Pokemon(filter: {
                        mutation_in: [CREATED]
                    }) {
                        node {
                            key,
                            name,
                            description,
                            image,
                            color
                        }
                    }
                }
            `,
            updateQuery: (previous, { subscriptionData }) => {
                const newAllPokemons = [
                    subscriptionData.data.Pokemon.node,
                    ...previous.allPokemons
                ]
                const result = {
                    ...previous,
                    allPokemons: newAllPokemons
                }
                return result
            }
        })
    }

    render() {
        if (this.props.allPokemonsQuery && this.props.allPokemonsQuery.loading) {
            return (
                <div className="progress">
                    <div className="indeterminate"></div>
                </div>
            )
        }

        if (this.props.allPokemonsQuery && this.props.allPokemonsQuery.error) {
          return <div>Error</div>
        }

        const pokemonsToRender = this.props.allPokemonsQuery.allPokemons

        return (
            <div>
                <DropdownList />
                <Nav />
                <div className="container">
                    <div className="section">
                        <div className="row">
                            {pokemonsToRender.map((pokemon) => (
                                <Cards key={pokemon.key} id={pokemon.key} name={pokemon.name} image={pokemon.image} description={pokemon.description} />
                            ))}
                        </div>
                    </div>
                </div>
                <FloatButton
                    options={this.state.options}
                    mainIcon={'mode_edit'}
                    mainColor={'red'}
                    orientation={'horizontal'} />
            </div>
        )
    }
}

export const ALL_POKEMONS_QUERY = gql`
  query allPokemonsQuery {
    allPokemons {
      key,
      name,
      description,
      image,
      color
    }
  }
`
export default graphql(ALL_POKEMONS_QUERY, { name: 'allPokemonsQuery' }) (CardList)
