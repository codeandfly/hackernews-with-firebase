import React, { useContext, useEffect, useState } from 'react';
import { FirebaseContext } from '../../firebase';
import LinkItem from './LinkItem';
import { LINKS_PER_PAGE } from '../../utils';

function LinkList(props) {
  const { firebase } = useContext(FirebaseContext);
  const [links, setLinks] = useState([]);
  const [cursor, setCursor] = useState(null);
  const isNewPage = props.location.pathname.includes('new');
  const isTopPage = props.location.pathname.includes('top');
  const page = Number(props.match.params.page);

  useEffect(() => {
    const unsubscribe = getLinks();

    return () => unsubscribe();
  }, [isTopPage, page]);

  function getLinks() {
    const hasCursor = Boolean(cursor);
    if (isTopPage) {
      return firebase.db
        .collection('links')
        .orderBy('voteCount', 'desc')
        .limit(LINKS_PER_PAGE)
        .onSnapshot(handleSnapshot);
    } else if (page === 1) {
      return firebase.db
        .collection('links')
        .orderBy('created', 'desc')
        .limit(LINKS_PER_PAGE)
        .onSnapshot(handleSnapshot);
    } else if (hasCursor) {
      return firebase.db
        .collection('links')
        .orderBy('created', 'desc')
        .startAfter(cursor.created)
        .limit(LINKS_PER_PAGE)
        .onSnapshot(handleSnapshot);
    }
  }

  function handleSnapshot(snapshot) {
    const links = snapshot.docs.map(doc => {
      return {
        id: doc.id,
        ...doc.data(),
      };
    });
    setLinks(links);
    const lastLink = links[links.length - 1];
    setCursor(lastLink);
  }

  function visitPreviousPage() {
    if (page > 1) {
      props.history.push(`/new/${page - 1}`);
    }
  }

  function visitNextPage() {
    // only if we have more links than can be displayed on current page
    if (page <= links.length / LINKS_PER_PAGE) {
      props.history.push(`/new/${page + 1}`);
    }
  }

  const pageIndex = page ? (page - 1) * LINKS_PER_PAGE + 1 : 0;

  return (
    <div>
      {links.map((link, index) => (
        <LinkItem
          key={link.id}
          showCount={true}
          link={link}
          index={index + pageIndex}
        />
      ))}
      <div className="pagination">
        <div className="pagination-link mr2" onClick={visitPreviousPage}>
          Previous
        </div>
        <div className="pagination-link mr2" onClick={visitNextPage}>
          Next
        </div>
      </div>
      {/* {isNewPage && (
      )} */}
    </div>
  );
}

export default LinkList;
