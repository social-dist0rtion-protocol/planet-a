import React from 'react';

import ProposalsList from "./volt/components/ProposalsList";
import SortContols from "./volt/components/SortControls";
import FilterControls from "./volt/components/FilterControls";
import Footer from "./volt/components/Footer";

export default class MainPage extends React.Component {
  render() {
    const {
      proposalsList,
      filterList,
      resetFilter,
      sort,
      toggleFavorites,
      filterQuery,
      favorites,
      voteStartTime,
      voteEndTime,
    } = this.props;

    return (
      <>
        <FilterControls
          filter={filterList}
          query={filterQuery}
          reset={resetFilter}
        />
        <SortContols sort={sort} />
        <ProposalsList
          list={proposalsList}
          toggle={toggleFavorites}
          favorites={favorites}
        />
        <Footer
          voteStartTime={voteStartTime}
          voteEndTime={voteEndTime}
          history={[
            { id: "EA001", votes: 2 },
            { id: "EA003", votes: 4 },
            { id: "EA002", votes: 1 }
          ]}
        />
      </>
    );
  }
}