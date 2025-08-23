import { AdaptivityProvider, AppRoot, ConfigProvider, Div, Group, Spacing } from '@vkontakte/vkui';
import React, { type JSX } from 'react';
import { createRoot } from 'react-dom/client';

import '@vkontakte/vkui/dist/vkui.css';

import { Auth } from './components/Auth/Auth';
import Export from './components/Export/Export';
import { SelectionInfo } from './components/Selection/SelectionInfo';
import { useActiveRepo } from './hooks/useActiveRepo';
import { useSelection } from './hooks/useSelection';
import { useSnackbar } from './hooks/useSnackbar';

function App(): JSX.Element {
  const { selectedNodes } = useSelection();
  const snackbar = useSnackbar();
  const { activeRepoOption } = useActiveRepo();

  return (
    <ConfigProvider>
      <AdaptivityProvider>
        <AppRoot>
          <Group>
            <Div>
              <Auth activeRepoOption={activeRepoOption} />
              <Spacing size={6}></Spacing>
              <SelectionInfo count={selectedNodes.length} />
              <Export selectedNodes={selectedNodes} />
              {snackbar}
            </Div>
          </Group>
        </AppRoot>
      </AdaptivityProvider>
    </ConfigProvider>
  );
}

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
