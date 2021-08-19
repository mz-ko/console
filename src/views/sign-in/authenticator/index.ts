import { store } from '@/store';
import VueRouter from 'vue-router';
import { SpaceRouter } from '@/routes';


abstract class Authenticator {
    static async signIn(credentials, userId?, userType?): Promise<void> {
        try {
            await store.dispatch('user/signIn', {
                domainId: store.state.domain.domainId,
                credentials,
                userType: userType || 'USER',
                userId,
            });
        } catch (e) {
            throw new Error(e);
        }
    }

    static async signOut(): Promise<void> {
        try {
            if (SpaceRouter.router) await SpaceRouter.router.app.$store.dispatch('user/signOut');
        } catch (e) {
            console.error('user sign out failed', e);
        }
    }
}


export {
    Authenticator,
};