import React, { useEffect, useState } from "react";
import {Appbar, Avatar, Button, Card, DataTable, Icon, Surface, Text} from "react-native-paper";
import { useLocalSearchParams, useRouter } from 'expo-router';
import SafeScreen from "@/components/SafeScreen/SafeScreen";
import { usePocketBase } from "@/components/Services/Pocketbase";
import {StyleSheet, ScrollView, ImageSourcePropType, Image} from "react-native";
import { useLoading } from "../../components/utils/LoadingContext";
import { MaterialIcons } from "@expo/vector-icons";
import { View } from "@/components/Themed";
import {codeToCurrency, ConvertCurrency, getReadableTime} from "../../components/utils";
import {BarChart, LineChart, PopulationPyramid} from "react-native-gifted-charts";

interface Comment {
  did: string;
  comment: string;
  rating: number;
  expand: {
    user: {
      id: string;
    };
  };
}

interface Pfi {
  name?: string;
  id?: string;
}

interface Rating {
  rating: number;
  rating_count: number|"Not Rated Yet";
}
const pfiImage: ImageSourcePropType = require('@/assets/images/pfi.png');
const ExplanationCard = () => {
    const [hidden, setHidden] = React.useState(false);
    console.log(hidden)
    return (
        !hidden && (
            <Card style={{ marginBottom: 150 }}>
                <Card.Cover style={{ width: "100%" }} source={pfiImage} />
                <Card.Content>
                    <Text variant="bodyMedium" style={{ marginBottom: 5, marginTop: 5 }}>
                        {"What is a PFI (Participating Financial Institution?"}
                    </Text>
                    <Text variant="bodySmall">
                        {"In the NexX wallet, PFIs (Participating Financial Institutions) play a crucial role."+
                         "Think of them as trusted financial partners who provide liquidity—this means they ensure there is enough money available for users to complete transactions smoothly."+
                         "They help verify important information about users and the transactions being made, using Verifiable Credentials (VCs) to confirm details in a secure way."+
                         "By connecting to PFIs, NexX allows users to transfer money, exchange currencies, and even invest their savings, all while ensuring the process is trustworthy."+
                         "Essentially, PFIs help make sure every transaction within the NexX wallet happens safely and efficiently,"+
                         "which is why they are vital to its operation."}
                    </Text>
                </Card.Content>
                <Card.Actions>
                    <Button
                        style={{ alignSelf: "flex-end" }}
                        icon={() => <Icon size={20} source={"close"} />}
                        onPress={() => setHidden(!hidden)}
                    >
                        {"Close"}
                    </Button>
                </Card.Actions>

            </Card>
        )
    );
};
export default function PfiId() {
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <MaterialIcons
          key={i}
          name={i <= rating ? 'star' : 'star-border'}
          size={20}
          color="#FFD700"
        />
      );
    }
    return <View style={styles.starsContainer}>{stars}</View>;
  };

  const router = useRouter();
  const { setLoading } = useLoading();
  const { pfiId } = useLocalSearchParams();
  const { pb } = usePocketBase();
  const [pfi, setPfi] = useState<Pfi>({});
  const [pfiComments, setPfiComments] = useState<Comment[]>([]);
  const [rating, setRating] = useState<Rating>({ rating: 0, rating_count: 0 });
  const [exchangeRates, setExchangeRates] = useState<any>()
    const [averageTime, setAverageTime]=useState<Number|String>(0);
    const [offeringList, setOfferingList]=useState<any>()
    const[comparisonData, setComparisonData]=useState<any>()
    const [marketData, setMarketData]=useState<any>()



  const getUserDid = async (comment: Comment) => {
    const user = comment.expand.user;
    try {
        const user_did = await pb.collection("customer_did").getFirstListItem(`user="${user.id}"`);
        return {
            ...comment,
            did: user_did.did.uri,
        };
    } catch (error) {
        return {
            ...comment,
            did: "NexX User",
        };
    }
  };


    const getPfi = async () => {
        setPfi({});
        setPfiComments([]);
        try {
            // Fetching PFI Record
            const pfiRecord = await pb.collection('pfi').getFirstListItem(`did="${pfiId}"`);
            setPfi(pfiRecord);

            // Fetching PFI Rating and Comments
            try{
                const pfiRecordComment = await pb.collection('pfi_rating').getFullList({
                    filter: `pfi="${pfiRecord.id}"`,
                    expand: "user",
                });
                // Fetching comments with DID
                const commentsWithDid = await Promise.all(pfiRecordComment.map(getUserDid));
                setPfiComments(commentsWithDid);
            }
            catch (e) {

            }
            try{
                const rating = await pb.collection("pfi_average_rating").getFirstListItem(`pfi="${pfiRecord.id}"`);
                setRating(rating);
            }
            catch (e) {
                setRating({ rating: 5, rating_count: "Not Rated Yet" });
            }




            // Fetching Exchange Rates
            const exchangeRates = await pb.collection('pfi_stats_per_pairing').getFullList({
                filter: `pfi_name="${pfiRecord.name}"`,
                sort: '-created',
            });

            setExchangeRates(exchangeRates);
            setAverageTime(getReadableTime(exchangeRates[0].avg_estimated_settlement_time));

            // Process Offerings and Set Comparison Data
            let pfiData = [];
            if (pfiRecord.offerings) {
                for (const offer of Object.values(pfiRecord.offerings)) {
                    try {
                        const marketValue = exchangeRates.filter((t: any) => t.pairing === offer)[0]?.payout_per_unit;
                        const pfiValue = await ConvertCurrency(offer.split(":")[0], offer.split(":")[1]);

                        // Push comparison data
                        pfiData.push({
                            left: marketValue,
                            right: pfiValue,
                            leftBarLabel: "Market",
                            rightBarLabel: "PFI",
                            currency: offer,
                            key: offer,  // Assign a unique key based on the offering
                        });
                    } catch (e) {
                        console.error(`Error processing offering ${offer}`, e);
                    }
                }
            }
            setComparisonData(pfiData);  // Set processed comparison data
        } catch (e) {
            console.error('Error fetching PFI data:', e);
        }
    };




    useEffect(() => {
    setLoading(true);
    getPfi().then(() => {


    }).finally(() => {

      setLoading(false);
    });



  }, [router, pfiId]);


  const PFIAnalytics=()=>{
      return(
          <>
              {comparisonData&&<Surface style={styles.pfiContainer} elevation={3}>
                  <Text variant={"titleMedium"} style={styles.pfiName}>
                      PFI Performance Against Market
                  </Text>

                  {comparisonData.map((data, index) => (
                      <PopulationPyramid
                          key={index} // Use the array index as a unique key
                          height={15}
                          width={350}
                          barLabelColor={"white"}
                          xAxisLabelColor={"white"}
                          data={[data]}
                      />
                  ))}

                  <DataTable>
                      <DataTable.Header>
                          <DataTable.Title numeric>Currency</DataTable.Title>
                          <DataTable.Title numeric>Market</DataTable.Title>
                          <DataTable.Title numeric>{pfi.name}</DataTable.Title>
                      </DataTable.Header>

                      {comparisonData.map((item) => (
                          <DataTable.Row key={item.key}>
                              <DataTable.Cell >{item.currency.replace(":"," to ")}</DataTable.Cell>
                              <DataTable.Cell numeric>{item.right}</DataTable.Cell>
                              <DataTable.Cell numeric>{item.left}</DataTable.Cell>
                          </DataTable.Row>
                      ))}


                  </DataTable>


              </Surface>}
          </>
      )
  }




  return <View style={styles.container}>
    <Appbar.Header>
      <Appbar.BackAction onPress={() => { router.back() }} />
      <Appbar.Content title={pfi.name !== undefined ? `🏦 ${pfi.name}` : ""} />
    </Appbar.Header>
    <SafeScreen onRefresh={() => { setLoading(true); getPfi().then(() => setLoading(false)) }}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <Surface style={styles.pfiContainer} elevation={3}>
          <Text variant={"titleMedium"} style={styles.pfiName}>
            {pfi.name || "⏳"}
          </Text>
          <View style={styles.ratingContainer}>
            {renderStars(rating.rating)}
            <Text style={styles.ratingCount}>({rating.rating_count})</Text>
          </View>
            <View style={styles.ratingContainer}>
                <Text style={styles.ratingCount} variant={"bodySmall"}>{pfi.description}</Text>
            </View>
            <Text style={styles.pfiId} variant={"bodySmall"}>
                Settlement Time: {averageTime}
            </Text>
          <Text style={styles.pfiId} variant={"bodySmall"}>
            DID: {pfiId}
          </Text>
        </Surface>

          <Surface style={styles.pfiContainer} elevation={3}>
              <Text variant={"titleMedium"} style={styles.pfiName}>
                  Offerings
              </Text>
              <View style={styles.ratingContainer}>


                  {pfi.offerings && exchangeRates&&

                      Object.values(pfi.offerings).map((offering, index) => {

                          // const rate = exchangeRates.filter()
                          return <Text key={index}
                                style={styles.ratingCount}> • {codeToCurrency(offering.replace(':', ' to '))} {"\n"}( {`1 ${offering.split(":")[0]} = ${exchangeRates.filter((t: any) => t.pairing === offering && t.pfi_name===pfi.name)[0]?.payout_per_unit} ${offering.split(":")[1]}` })  </Text>
                      })
                  }
              </View>

          </Surface>
          <PFIAnalytics/>
        <Surface style={styles.commentsContainer} elevation={3}>
            <Text variant={"titleMedium"} style={styles.pfiName}>
                Comments
            </Text>
          {pfiComments.length === 0 ? <Text>No comments yet</Text> :
            pfiComments.map((comment, index) => {
              return <Surface key={index} style={styles.comment} elevation={1}>
                  <Text style={styles.commentText}>
                      Comment: {comment.comment}
                  </Text>
                  <View style={styles.commentRating}>
                    {renderStars(comment.rating)}
                  </View>
                    <View style={{flexDirection:"row", backgroundColor:"transparent"}}>
                        {/*<Avatar.Image size={20} source={()=>(<Image source={{uri: "https://api.dicebear.com/9.x/pixel-art/png?seed=" + comment.did}}/>)} style={{marginBottom:20}} />*/}
                        <Text variant={"bodySmall"} style={styles.commentDid}>
                            {comment.did}
                        </Text>
                    </View>

                </Surface>
            })
          }
        </Surface>
          <ExplanationCard/>
      </ScrollView>
    </SafeScreen>
  </View>;
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    // backgroundColor: '#f5f5f5',
  },
  scrollView: {
    padding: 20,
  },
  pfiContainer: {
    flexDirection: "column",
    width: "100%",
    marginVertical: 30,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    borderRadius: 10,
    // backgroundColor: '#fff',
  },
  pfiName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  ratingContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: 'center',
    marginVertical: 10,
      backgroundColor: "transparent",
  },
  ratingCount: {
    marginLeft: 10,
    fontSize: 16,
    // color: '#757575',
  },
  pfiId: {
    fontSize: 16,
      margin:5
    // color: '#757575',
  },
  commentsContainer: {
    flexDirection: "column",
    width: "100%",
    marginVertical: 30,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    borderRadius: 10,
    // backgroundColor: '#fff',
  },
  comment: {
    flexDirection: "column",
    width: "100%",
    marginVertical: 10,
    justifyContent: "flex-start",
    alignItems: "flex-start",
    padding: 15,
    borderRadius: 10,
    // backgroundColor: '#f9f9f9',
  },
  commentDid: {
    fontSize: 14,
    // color: '#757575',
  },
  commentText: {
    fontSize: 16,
    // color: '#333',
    marginVertical: 10,
  },
  commentRating: {
    flexDirection: "row",
    flexWrap: "wrap",
      backgroundColor: "transparent",
      marginVertical: 10,
  },
  starsContainer: {
    flexDirection: "row",
    backgroundColor: "transparent",
  },
});