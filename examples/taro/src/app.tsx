import type { PropsWithChildren } from 'react';
import 'animal-island-ui/taro/style';
import './app.less';
if (process.env.TARO_ENV === 'h5') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- compile-time platform branch excludes H5 from weapp
    require('animal-island-ui/taro/h5').installH5Adapter();
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- compile-time platform branch excludes H5 from weapp
    require('animal-island-ui/taro/fonts');
}
export default function App({ children }: PropsWithChildren) {
    return children;
}
