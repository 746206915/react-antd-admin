import type { FC } from 'react';
import { useState } from 'react';
import { Space, Tag, Checkbox, message } from 'antd';
import { useParams } from 'react-router-dom'

import MyPage from '@/components/business/page';

const { Item: SearchItem } = MyPage.MySearch;

const UserListPage: FC = () => {
  const { appId } = useParams();
  

  return (
    <MyPage
    //   pageApi={getUserList}
      searchRender={
        <>
          <SearchItem label="FirstName" name="firstName" type="input" />
        </>
      }
      //tableOptions={tableColums}
    ></MyPage>
  );
};

export default UserListPage;