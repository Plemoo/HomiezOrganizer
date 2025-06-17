import useUiIcons from '@/assets/hooks/uiIconHook';
import { IComment, IDbComment } from '@/assets/interfaces/CommentInterface';
import { addDocumentToCollection, firebaseErrorHandling, getAllDocumentsOfCollection } from '@/assets/ts/firebaseExchange';
import { parseFirebaseComment } from '@/assets/ts/parsing';
import { formatDateAndTimeSmall } from '@/assets/ts/timeManagement';
import { serverTimestamp } from 'firebase/firestore/lite';
import i18next from 'i18next';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Modal, Pressable, Text, TextInput, TouchableHighlight, View } from 'react-native';
import { useUser } from './ProfileInformationContext';
import { useCustomTheme } from './ThemeContext';

const ActivityComments = ({ activityId, groupId }: { activityId: string, groupId: string }) => {
    const { theme } = useCustomTheme();
    const { t } = useTranslation();
    const uiIcon = useUiIcons();
    const { user } = useUser();
    const [commentText, setCommentText] = useState<string | undefined>();
    const [comments, setComments] = useState<IComment[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [commentTextModalVisible, setCommentTextModalVisible] = useState<boolean>(false);

    const createNewComment = () => {
        if (commentText && user && user.username) {
            let newComment: IDbComment = {
                userUuid: user.id,
                text: commentText,
                userIcon: user.icon,
                userName: user.username,
                createdAt: serverTimestamp() as any
            }
            addDocumentToCollection("Group", newComment, groupId, "Activity", activityId, "Comment")
                .then(() => fetchAllCommentsForActivity())
                .then(fetchedComments => setComments(sortCommentsByStartDate(fetchedComments)))
                .then(() => setCommentText(undefined))
        }
    };

    useEffect(() => {
        fetchAllCommentsForActivity()
            .then(fetchedComments => setComments(sortCommentsByStartDate(fetchedComments)))
            .catch(err => firebaseErrorHandling(err))
            .finally(() => setIsLoading(false));
    }, [])


    const fetchAllCommentsForActivity = (): Promise<IComment[]> => {
        return getAllDocumentsOfCollection("Group", groupId, "Activity", activityId, "Comment")
            .then((commentDocuments) => {
                if (!commentDocuments.empty) {
                    let commentsOfActivity: IComment[] = commentDocuments.docs.
                        map((commentDoc) => parseFirebaseComment(commentDoc))
                        .filter((comment) => comment !== null);
                    return commentsOfActivity;
                }
                return [];
            })
    }

    // TODO: Loading ausbauen
    if (isLoading) return <Text>IsLoading</Text>

    return (
        <View style={{ marginBottom: theme.spacing.medium }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: theme.spacing.small }}>
                <Text style={theme.typography.heading2}>{t("activities.commentTitle")}</Text>
                <Pressable onPress={() => setCommentTextModalVisible(true)} style={theme.rightCornerIcon}>
                    <uiIcon.PlusIcon size={30} color={theme.colors.primary} />
                </Pressable>
            </View>
            <View>
                <FlatList
                    data={comments}
                    scrollEnabled={false}
                    renderItem={({ item, index }) => (
                        <View
                            key={index}
                            style={[
                                {
                                    width: "85%",
                                    borderColor: theme.colors.secondary,
                                    borderWidth: 1,
                                    borderRadius: theme.borderRadius.medium,
                                    padding: theme.spacing.small,
                                    marginBottom: theme.spacing.small
                                },
                                item.userUuid === user.id ? { alignSelf: "flex-end" } : {}
                            ]}
                        >
                            <View>
                                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                    <Text style={[theme.typography.body, { fontWeight: "bold" }]}>{item.userName}:</Text>
                                    <Text style={[theme.typography.body, { fontStyle: "italic" }]}>{formatDateAndTimeSmall(item.createdAt, i18next.language)}</Text>
                                </View>
                                <Text style={theme.typography.body}>{item.text}</Text>
                            </View>
                        </View>
                    )}
                    ListEmptyComponent={
                        <View>
                            <View style={{ flexDirection: "row", gap: theme.spacing.small, width: "90%" }}>
                                <uiIcon.InfoIcon size={24} color={theme.colors.primary} />
                                <Text style={theme.typography.body}>{t("activities.emptyCommentsText")}</Text>
                            </View>
                        </View>
                    }
                />
            </View>
            <Modal
                animationType="slide"
                visible={commentTextModalVisible}
                transparent={false}
                onRequestClose={() => setCommentTextModalVisible(false)}
            >
                <View style={theme.containers.rootContainer}>
                    <Pressable style={theme.leftCornerIcon} onPress={() => setCommentTextModalVisible(false)}>
                        <uiIcon.ArrowLeftIcon size={30} color={theme.colors.primary} />
                    </Pressable>
                    <View style={[theme.input, { marginTop: theme.spacing.xlarge, marginBottom: theme.spacing.medium }]}>
                        <TextInput
                            multiline
                            autoFocus={true}
                            value={commentText}
                            onChangeText={setCommentText}
                            numberOfLines={5}
                            placeholder={t("activities.commentPlaceholder")}
                            style={[theme.typography.body, { minHeight: 24 * 5, textAlignVertical: "top" }]}
                        />
                    </View>
                    <View>
                        <TouchableHighlight
                            onPress={() => { createNewComment(); setCommentTextModalVisible(false) }}
                            style={theme.button}>
                            <Text style={theme.buttonText}>{t("activities.commentSubmit")}</Text>
                        </TouchableHighlight>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

export default ActivityComments

const sortCommentsByStartDate = (comments: IComment[]): IComment[] => {
    return comments.sort((a, b) => {
        return b.createdAt.getTime() - a.createdAt.getTime();
    });
};